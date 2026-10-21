import { voiceCurtainLayout as L } from './hero-field-light';
import type { FieldParticleSeed } from './hero-field-model';

/**
 * Canvas port of the WebGPU Voice curtains (`hero-field-light.ts` and the
 * medium pass in `hero-particle-shader.ts`). The light function is the same
 * analytic field; the Canvas field evaluates its depth integral on a coarse
 * host-uv grid, a few rows per frame, and upscales it with screen blending.
 * `tests/hero-voice-curtains.test.ts` compares this port with the WGSL source.
 */

export type CurtainFrame = {
  hostWidth: number;
  hostHeight: number;
  mobile: 0 | 1;
  aspect: number;
  centerX: number;
  centerY: number;
  bandWidth: number;
  bandRadius: number;
  envelopeWidth: number;
};

export function curtainFrame(hostWidth: number, hostHeight: number): CurtainFrame {
  const width = Math.max(1, hostWidth);
  const height = Math.max(1, hostHeight);
  const mobile = width <= L.phoneMaxWidth ? 1 : 0;
  const aspect = width / height;
  const layout = mobile ? 'phone' : 'desktop';
  return {
    hostWidth: width,
    hostHeight: height,
    mobile,
    aspect,
    centerX: L.center[layout][0],
    centerY: L.center[layout][1],
    bandWidth: L.bandWidth[layout] * aspect,
    bandRadius: mobile ? 2 : 6,
    envelopeWidth: mobile ? 1.8 : 5,
  };
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** `mediumLightWGSL` at one point of the medium (q in host-height units). */
export function curtainIllumination(
  c: CurtainFrame,
  qx: number,
  qy: number,
  qz: number,
  clock: number,
  amplitude: number,
) {
  const wave =
    Math.sin(qy * 5 + qz * 1.7 - clock * 0.31) * 0.012 + Math.sin(qz * 3.1 + clock * 0.22) * 0.014;
  const beamX = qx + wave + qy * 0.025;
  const radius = c.bandRadius;
  const band = Math.floor(beamX / c.bandWidth + radius + 0.5);
  const envelope = Math.exp(-(((band - radius) / c.envelopeWidth) ** 2));
  let beam = 0;
  if (band >= 0 && band <= radius * 2) {
    const span =
      (0.095 + envelope * 0.29) *
      (0.92 + 0.08 * Math.sin(clock * 0.65 + band * 0.85) + amplitude * 0.32);
    const beamWidth = c.bandWidth * (0.42 + 0.1 * Math.sin(qy * 7 + band * 0.73 + clock * 0.18));
    const distance = (beamX - (band - radius) * c.bandWidth) / beamWidth;
    // Beyond four widths the core is below 1e-7: skip the remaining terms.
    if (distance * distance < 16)
      beam =
        Math.exp(-distance * distance) * Math.exp(-((Math.abs(qy - 0.055) / span) ** 4) * 0.85);
  }
  const ridgeY = 0.12 + Math.sin(qx * 5.5 + qz * 1.2 - clock * 0.23) * 0.065;
  const ridgeDistance = (qy - ridgeY) / 0.022;
  const ridge =
    ridgeDistance * ridgeDistance < 16
      ? Math.exp(-ridgeDistance * ridgeDistance) * Math.exp(-((qx / (c.aspect * 0.34)) ** 2))
      : 0;
  if (beam === 0 && ridge === 0) return 0;
  const eddy =
    beam === 0
      ? 0
      : 0.67 +
        0.18 * Math.sin(qx * 17 + qy * 8 + qz * 4 - clock * 0.27) +
        0.15 * Math.sin(qy * 21 - qz * 5 + clock * 0.19);
  const lowerFade = 1 - c.mobile * smoothstep(0.12, 0.32, qy) * 0.85;
  return (beam * eddy * (0.8 + ridge * 0.6) + ridge * envelope * 0.2) * lowerFade;
}

/** Curtain light at a field position in CSS pixels: the GPU motes' `curtainLight`. */
export function curtainLightAt(
  c: CurtainFrame,
  x: number,
  y: number,
  clock: number,
  amplitude: number,
) {
  const qx = (x / c.hostWidth - c.centerX) * c.aspect;
  const qy = y / c.hostHeight - c.centerY;
  return Math.min(1, Math.max(0, curtainIllumination(c, qx, qy, 0, clock, amplitude)));
}

/** Voice target of a shaft mote: the GPU motes' `curtainTarget`, in CSS pixels. */
export function curtainTarget(
  c: CurtainFrame,
  particle: FieldParticleSeed,
  flowDepth: number,
  time: number,
  cameraX: number,
  cameraY: number,
  out: { x: number; y: number },
) {
  const count = c.mobile ? 5 : 13;
  const band =
    (c.mobile ? Math.floor((particle.band * 5) / 13) : particle.band) - (count - 1) * 0.5;
  const span = 0.095 + Math.exp(-((band / (c.mobile ? 1.8 : 5)) ** 2)) * 0.29;
  const qx = band * c.bandWidth + particle.audioJitter * c.bandWidth * 0.42;
  const qy = 0.055 + (particle.v * 2 - 1) * span;
  const driftX = Math.sin(qy * 9 + particle.seed * 6.28 + time * 0.48) * 0.018;
  const driftY =
    Math.cos(qx * 8 + particle.sphereTheta + time * 0.39) * 0.016 +
    Math.sin(time * 0.63 + particle.u * 8) * 0.011;
  const z = (flowDepth - 0.5) * 1.7;
  const perspective = 4 / (4 + z);
  out.x = (c.centerX + ((qx + driftX) * perspective + cameraX * z * 0.05) / c.aspect) * c.hostWidth;
  out.y = (c.centerY + (qy + driftY) * perspective + cameraY * z * 0.05) * c.hostHeight;
  return out;
}

/**
 * Depth samples of the GPU raymarch that carry the light. The outer samples
 * (less than 10% of the peak weight, about 4% of the total) are dropped and
 * their weight is spread over the rest; the result stays within 4/255 of the
 * full march.
 */
const depthSamples = (() => {
  const all = Array.from({ length: L.samples }, (_, index) => {
    const qz = L.sampleStart + (index + 0.5) * L.sampleStep - 4;
    return { qz, weight: Math.exp(-qz * qz * L.depthFalloff) };
  });
  const total = all.reduce((sum, sample) => sum + sample.weight, 0);
  const kept = all.filter((sample) => sample.weight >= 0.1);
  const keptTotal = kept.reduce((sum, sample) => sum + sample.weight, 0);
  return kept.map((sample) => ({ ...sample, weight: (sample.weight * total) / keptTotal }));
})();

export type CurtainGrid = { cols: number; rows: number; data: Uint8ClampedArray };
export type CurtainPalette = { bright: number[]; cyan: number[]; violet: number[] };

/**
 * The WebGPU medium works as the Shaders library does: CSS colours become
 * linear Display P3, light is integrated there, and the straight colour is
 * sRGB-encoded onto the page. Convert "r, g, b" palette tokens the same way.
 */
export function curtainPalette(bright: string, cyan: string, violet: string): CurtainPalette {
  const toP3Linear = (value: string) => {
    const [r, g, b] = value.split(',').map((part) => {
      const channel = Number(part.trim()) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return [
      0.8224621 * r + 0.177538 * g,
      0.0331941 * r + 0.9668058 * g,
      0.0170827 * r + 0.0723974 * g + 0.9105199 * b,
    ];
  };
  return { bright: toP3Linear(bright), cyan: toP3Linear(cyan), violet: toP3Linear(violet) };
}

/** sRGB transfer function, as the library's final pass applies it. */
export const curtainEncode = (value: number) => {
  const linear = Math.min(1, Math.max(0, value));
  return linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
};
const encodeSteps = 4096;
const encoded = Float32Array.from({ length: encodeSteps + 1 }, (_, index) =>
  curtainEncode(index / encodeSteps),
);
const encode = (value: number) =>
  encoded[Math.min(encodeSteps, Math.max(0, Math.round(value * encodeSteps)))];

/** Rows of the grid per host height; about 6.8 CSS px per cell at 870px. */
export const curtainGridRows = 128;

export function curtainGridSize(hostWidth: number, hostHeight: number) {
  const rows = curtainGridRows;
  return { cols: Math.max(1, Math.ceil((hostWidth / Math.max(1, hostHeight)) * rows)), rows };
}

const toneSteps = 4096;
const toneRange = 6;
const tone = Float32Array.from(
  { length: toneSteps + 1 },
  (_, index) => 1 - Math.exp(-((index / toneSteps) * toneRange) * L.exposure),
);
const toneMap = (radiance: number) =>
  tone[Math.min(toneSteps, Math.round((radiance / toneRange) * toneSteps))];

type Scratch = {
  cols: number;
  columns: Float32Array;
  radiance: Float32Array;
  transmittance: Float32Array;
};
let scratch: Scratch | null = null;
const columnFields = 6;

/**
 * Integrate the curtains for every `stride`-th row from `start` into RGBA
 * (straight alpha, sRGB-encoded), as the WebGPU medium pass would draw them
 * at each cell's centre. `palette` is linear (see `curtainPalette`).
 */
export function renderCurtainRows(
  grid: CurtainGrid,
  c: CurtainFrame,
  clock: number,
  amplitude: number,
  cameraX: number,
  cameraY: number,
  palette: CurtainPalette,
  start: number,
  stride: number,
) {
  const { cols, rows, data } = grid;
  const samples = depthSamples.length;
  if (!scratch || scratch.cols !== cols)
    scratch = {
      cols,
      columns: new Float32Array(cols * samples * columnFields),
      radiance: new Float32Array(cols * 3),
      transmittance: new Float32Array(cols),
    };
  const { columns, radiance, transmittance } = scratch;
  const radius = c.bandRadius;
  const bands = radius * 2 + 1;
  const camX = cameraX * L.cameraShift;
  const camY = cameraY * L.cameraShift;
  const fogGain = c.mobile ? L.floorFog.phone : L.floorFog.desktop;

  // Per-band terms, plus colour for bands -1..2R+1 (beyond that it saturates).
  const span = new Float32Array(bands);
  const envelope = new Float32Array(bands);
  const bandSin = new Float32Array(bands);
  const bandCos = new Float32Array(bands);
  for (let band = 0; band < bands; band += 1) {
    envelope[band] = Math.exp(-(((band - radius) / c.envelopeWidth) ** 2));
    span[band] =
      (0.095 + envelope[band] * 0.29) *
      (0.92 + 0.08 * Math.sin(clock * 0.65 + band * 0.85) + amplitude * 0.32);
    bandSin[band] = Math.sin(band * 0.73);
    bandCos[band] = Math.cos(band * 0.73);
  }
  const colors = new Float32Array((bands + 2) * 3);
  for (let band = -1; band <= bands; band += 1) {
    const colorBand = (band * 6) / radius;
    const cyanWeight = 1 - smoothstep(L.colorBands.cyanFrom, L.colorBands.cyanTo, colorBand);
    const violetWeight = smoothstep(L.colorBands.violetFrom, L.colorBands.violetTo, colorBand);
    for (let channel = 0; channel < 3; channel += 1) {
      const base =
        palette.bright[channel] + (palette.cyan[channel] - palette.bright[channel]) * cyanWeight;
      colors[(band + 1) * 3 + channel] = base + (palette.violet[channel] - base) * violetWeight;
    }
  }

  // Per-sample column terms.
  for (let sample = 0; sample < samples; sample += 1) {
    const { qz } = depthSamples[sample];
    const scale = (qz + 4) / 4;
    for (let col = 0; col < cols; col += 1) {
      const qx = ((col + 0.5) / cols - c.centerX) * c.aspect * scale + camX * qz;
      const offset = (sample * cols + col) * columnFields;
      columns[offset] = qx;
      columns[offset + 1] = Math.sin(qx * 17);
      columns[offset + 2] = Math.cos(qx * 17);
      columns[offset + 3] = 0.12 + Math.sin(qx * 5.5 + qz * 1.2 - clock * 0.23) * 0.065;
      columns[offset + 4] = Math.exp(-((qx / (c.aspect * 0.34)) ** 2));
      columns[offset + 5] = Math.exp(-((qx / (c.aspect * L.floorFog.width)) ** 2)) * fogGain;
    }
  }

  const heightFade = new Float32Array(bands);
  const bright = palette.bright;
  for (let row = start; row < rows; row += stride) {
    const py = (row + 0.5) / rows - c.centerY;
    radiance.fill(0);
    transmittance.fill(1);
    for (let sample = 0; sample < samples; sample += 1) {
      const { qz, weight } = depthSamples[sample];
      const qy = py * ((qz + 4) / 4) + camY * qz;
      const shift =
        Math.sin(qy * 5 + qz * 1.7 - clock * 0.31) * 0.012 +
        Math.sin(qz * 3.1 + clock * 0.22) * 0.014 +
        qy * 0.025;
      const widthSin = Math.sin(qy * 7 + clock * 0.18);
      const widthCos = Math.cos(qy * 7 + clock * 0.18);
      const eddyPhase = qy * 8 + qz * 4 - clock * 0.27;
      const eddySin = Math.sin(eddyPhase);
      const eddyCos = Math.cos(eddyPhase);
      const eddyRow = 0.67 + 0.15 * Math.sin(qy * 21 - qz * 5 + clock * 0.19);
      const lowerFade = 1 - c.mobile * smoothstep(0.12, 0.32, qy) * 0.85;
      const fogRow = Math.exp(-(((qy - L.floorFog.y) / L.floorFog.height) ** 2));
      const fromRidgeline = Math.abs(qy - 0.055);
      for (let band = 0; band < bands; band += 1)
        heightFade[band] = Math.exp(-((fromRidgeline / span[band]) ** 4) * 0.85);
      const base = sample * cols * columnFields;
      for (let col = 0; col < cols; col += 1) {
        const offset = base + col * columnFields;
        const qx = columns[offset];
        const beamX = qx + shift;
        const band = Math.floor(beamX / c.bandWidth + radius + 0.5);
        const inBand = band >= 0 && band < bands;
        let illumination = 0;
        const ridgeDistance = (qy - columns[offset + 3]) / 0.022;
        const ridgeSquared = ridgeDistance * ridgeDistance;
        const ridge = ridgeSquared < 16 ? Math.exp(-ridgeSquared) * columns[offset + 4] : 0;
        if (inBand) {
          const beamWidth =
            c.bandWidth * (0.42 + 0.1 * (widthSin * bandCos[band] + widthCos * bandSin[band]));
          const distance = (beamX - (band - radius) * c.bandWidth) / beamWidth;
          const squared = distance * distance;
          if (squared < 16) {
            const eddy =
              eddyRow + 0.18 * (columns[offset + 1] * eddyCos + columns[offset + 2] * eddySin);
            illumination = Math.exp(-squared) * heightFade[band] * eddy * (0.8 + ridge * 0.6);
          }
        }
        if (ridge > 1e-5) {
          const bandEnvelope = inBand
            ? envelope[band]
            : Math.exp(-(((band - radius) / c.envelopeWidth) ** 2));
          illumination += ridge * bandEnvelope * 0.2;
        }
        const density =
          (illumination * lowerFade * L.illuminationGain + fogRow * columns[offset + 5]) * weight;
        if (density < 1e-6) continue;
        const colorIndex = (Math.min(bands, Math.max(-1, band)) + 1) * 3;
        const white = ridge * L.ridgeWhite;
        const light = transmittance[col] * L.scatter * density;
        const red = colors[colorIndex];
        const green = colors[colorIndex + 1];
        const blue = colors[colorIndex + 2];
        radiance[col * 3] += light * (red + (bright[0] - red) * white);
        radiance[col * 3 + 1] += light * (green + (bright[1] - green) * white);
        radiance[col * 3 + 2] += light * (blue + (bright[2] - blue) * white);
        const extinction = density * L.extinction;
        transmittance[col] *= 1 - extinction * (1 - extinction * 0.5);
      }
    }
    for (let col = 0; col < cols; col += 1) {
      const red = toneMap(radiance[col * 3]);
      const green = toneMap(radiance[col * 3 + 1]);
      const blue = toneMap(radiance[col * 3 + 2]);
      const alpha = Math.min(L.maxAlpha, Math.max(red, green, blue));
      const pixel = (row * cols + col) * 4;
      const unpremultiply = alpha > 0 ? 1 / alpha : 0;
      data[pixel] = encode(red * unpremultiply) * 255;
      data[pixel + 1] = encode(green * unpremultiply) * 255;
      data[pixel + 2] = encode(blue * unpremultiply) * 255;
      data[pixel + 3] = alpha * 255;
    }
  }
}

/**
 * The Canvas field's curtain layer: a small grid canvas refreshed `stride`
 * rows at a time (the light drifts by well under a pixel between refreshes)
 * and drawn over the host box with screen blending.
 */
export function createCurtainLayer() {
  let canvas: HTMLCanvasElement | null = null;
  let gridContext: CanvasRenderingContext2D | null = null;
  let image: ImageData | null = null;
  let phase = 0;
  let stale = true;

  return {
    /** Mark the grid for a full refresh (first show, resize, theme or reduced motion). */
    invalidate() {
      stale = true;
    },
    update(
      c: CurtainFrame,
      clock: number,
      amplitude: number,
      cameraX: number,
      cameraY: number,
      palette: CurtainPalette,
      stride: number,
    ) {
      const { cols, rows } = curtainGridSize(c.hostWidth, c.hostHeight);
      if (!canvas) canvas = document.createElement('canvas');
      if (canvas.width !== cols || canvas.height !== rows || !image) {
        canvas.width = cols;
        canvas.height = rows;
        gridContext = canvas.getContext('2d');
        image = gridContext?.createImageData(cols, rows) ?? null;
        stale = true;
      }
      if (!image || !gridContext) return;
      const grid = { cols, rows, data: image.data };
      if (stale || stride <= 1) {
        renderCurtainRows(grid, c, clock, amplitude, cameraX, cameraY, palette, 0, 1);
        stale = false;
      } else {
        phase = (phase + 1) % stride;
        renderCurtainRows(grid, c, clock, amplitude, cameraX, cameraY, palette, phase, stride);
      }
      gridContext.putImageData(image, 0, 0);
    },
    draw(context: CanvasRenderingContext2D, c: CurtainFrame, alpha: number) {
      if (!canvas || alpha <= 0) return;
      context.save();
      context.globalCompositeOperation = 'screen';
      context.globalAlpha *= alpha;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(canvas, 0, 0, c.hostWidth, c.hostHeight);
      context.restore();
    },
  };
}
