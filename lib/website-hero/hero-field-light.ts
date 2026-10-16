/**
 * Voice curtains: one layout for both Hero renderers. The WebGPU medium pass
 * (`hero-particle-shader.ts`), the GPU motes (`hero-particle-motion.ts`) and
 * the Canvas field (`hero-voice-curtains.ts`) all read these values, so the
 * curtain positions, widths, colours and exposure cannot drift apart.
 */
export const voiceCurtainLayout = {
  /** Host widths at or below this use the phone composition (five broad curtains). */
  phoneMaxWidth: 640,
  /** Curtain centre in host uv, desktop then phone. */
  center: { desktop: [0.715, 0.43], phone: [0.63, 0.34] },
  /** Curtain spacing in host-height units, multiplied by the host aspect. */
  bandWidth: { desktop: 0.045, phone: 0.095 },
  /** Pointer parallax of the curtain medium per unit of depth. */
  cameraShift: 0.026,
  /** Raymarch: `samples` steps of `sampleStep` from `sampleStart` along z. */
  samples: 12,
  sampleStart: 2.5,
  sampleStep: 0.25,
  depthFalloff: 4.5,
  scatter: 0.26,
  illuminationGain: 1.16,
  extinction: 0.04,
  exposure: 1.65,
  maxAlpha: 0.94,
  floorFog: { y: 0.43, height: 0.12, width: 0.43, desktop: 0.12, phone: 0.035 },
  /** Colour band index (0-12 scale): cyan below, bright between, violet above. */
  colorBands: { cyanFrom: 3.5, cyanTo: 5, violetFrom: 7, violetTo: 8.5 },
  ridgeWhite: 0.1,
} as const;

/** WGSL float literal for a shared constant (always carries a decimal point). */
export const wgslFloat = (value: number) =>
  Number.isInteger(value) ? value.toFixed(1) : String(value);

const L = voiceCurtainLayout;
const f = wgslFloat;

/** WGSL: curtain centre in host uv for a 0/1 `mobile` value. */
export const curtainCenterWGSL = (mobile: string) =>
  `vec2f(mix(${f(L.center.desktop[0])}, ${f(L.center.phone[0])}, ${mobile}), mix(${f(L.center.desktop[1])}, ${f(L.center.phone[1])}, ${mobile}))`;

/** WGSL: curtain spacing for a 0/1 `mobile` value and the host aspect. */
export const curtainBandWidthWGSL = (mobile: string, aspect: string) =>
  `mix(${f(L.bandWidth.desktop)}, ${f(L.bandWidth.phone)}, ${mobile}) * ${aspect}`;

// Shared source keeps the Voice curtains and the motes they light in step.
// `hero-voice-curtains.ts` ports this block to the Canvas field, and
// `tests/hero-voice-curtains.test.ts` transliterates it to keep that port exact.
export const mediumLightWGSL = `
  let wave = sin(q.y * 5.0 + q.z * 1.7 - clock * 0.31) * 0.012
    + sin(q.z * 3.1 + clock * 0.22) * 0.014;
  let beamX = q.x + wave + q.y * 0.025;
  let bandRadius = mix(6.0, 2.0, mobile);
  let band = floor(beamX / bandWidth + bandRadius + 0.5);
  let envelope = exp(-pow((band - bandRadius) / mix(5.0, 1.8, mobile), 2.0));
  let span = (0.095 + envelope * 0.29)
    * (0.92 + 0.08 * sin(clock * 0.65 + band * 0.85) + amplitude * 0.32);
  let beamWidth = bandWidth * (0.42 + 0.10 * sin(q.y * 7.0 + band * 0.73 + clock * 0.18));
  let core = exp(-pow((beamX - (band - bandRadius) * bandWidth) / beamWidth, 2.0));
  let heightFade = exp(-pow(abs(q.y - 0.055) / span, 4.0) * 0.85);
  let beam = core * heightFade * step(0.0, band) * step(band, bandRadius * 2.0);
  let eddy = 0.67 + 0.18 * sin(q.x * 17.0 + q.y * 8.0 + q.z * 4.0 - clock * 0.27)
    + 0.15 * sin(q.y * 21.0 - q.z * 5.0 + clock * 0.19);
  let ridgeY = 0.12 + sin(q.x * 5.5 + q.z * 1.2 - clock * 0.23) * 0.065;
  let ridge = exp(-pow((q.y - ridgeY) / 0.022, 2.0))
    * exp(-pow(q.x / (aspect * 0.34), 2.0));
  // Keep the phone's lower copy and actions quiet while retaining depth above.
  let lowerFade = 1.0 - mobile * smoothstep(0.12, 0.32, q.y) * 0.85;
  let illumination = (beam * eddy * (0.8 + ridge * 0.6)
    + ridge * envelope * 0.20) * lowerFade;
`;
