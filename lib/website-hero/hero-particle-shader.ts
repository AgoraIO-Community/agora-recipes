import { createGpuUniformsMap } from 'shaders/core';
import { defineShader, transformColor, wgsl } from 'shaders/std';
import {
  curtainBandWidthWGSL,
  curtainCenterWGSL,
  mediumLightWGSL,
  voiceCurtainLayout as curtain,
  wgslFloat as f,
} from './hero-field-light';

// The atmosphere pass reproduces the Canvas field's light: refractive panes,
// the source bloom and thirteen shafts built from soft glow lobes, all
// composited with "screen" exactly as the Canvas field does on dark. Positions
// use the Canvas field's viewport-sized space, anchored at the field's
// top-left corner. GPU-only additions: `medium`, a faint density drift
// travelling up each shaft, and Voice's volumetric light curtains from the
// first WebGPU pass, which replace the Canvas shafts and bloom in Voice and
// cross-fade with the eased Voice intent. `copyGuard` (off by default) can
// keep the curtains out of the measured Hero copy.
export const heroParticleShader = defineShader({
  name: 'AgoraHeroAtmosphere',
  props: {
    hostWidth: { default: 1 },
    hostHeight: { default: 1 },
    fieldWidth: { default: 1 },
    fieldHeight: { default: 1 },
    clock: { default: 0 },
    audioIntent: { default: 0 },
    videoIntent: { default: 0 },
    sphereMode: { default: 0 },
    cameraX: { default: 0 },
    cameraY: { default: 0 },
    story: { default: 0 },
    lightTheme: { default: 0 },
    present: { default: 1 },
    medium: { default: 0.1 },
    amplitude: { default: 0 },
    voiceVolume: { default: 1 },
    mobile: { default: 0 },
    copyGuard: { default: 0 },
    copyLeft: { default: 0 },
    copyTop: { default: 0 },
    copyRight: { default: 0 },
    copyBottom: { default: 0 },
    bright: { default: '#e1edf6', transform: transformColor },
    cyan: { default: '#48c5e1', transform: transformColor },
    violet: { default: '#8b70e4', transform: transformColor },
  },
  paint: wgsl(`
    let px = uv * vec2f(hostWidth, hostHeight);
    let w = fieldWidth;
    let h = fieldHeight;
    let shortSide = min(w, h);
    var color = vec3f(0.0);
    var alpha = 0.0;
    let layerAlpha = 1.0 - story * 0.985;
    let suppression = clamp(max(videoIntent, sphereMode), 0.0, 1.0);
    let voice = clamp(audioIntent * (1.0 - suppression), 0.0, 1.0) * voiceVolume;
    // Voice light stays out of the Hero copy, feathered over 120px.
    let copyInside = smoothstep(copyLeft - 120.0, copyLeft, px.x)
      * (1.0 - smoothstep(copyRight, copyRight + 120.0, px.x))
      * smoothstep(copyTop - 120.0, copyTop, px.y)
      * (1.0 - smoothstep(copyBottom, copyBottom + 120.0, px.y));
    let themeScale = select(1.42, 0.34, lightTheme > 0.5)
      * (1.0 - suppression * 0.94) * (1.0 + audioIntent * 0.38);

    // Refractive panes: ceiling, floor and two slow density pockets.
    let activeMedia = clamp(0.16 + videoIntent * 0.56 + sphereMode * 0.62, 0.0, 1.0)
      * select(1.0, 0.34, lightTheme > 0.5);
    let shimmer = sin(clock * 0.21) * w * 0.018;
    let drift = vec2f(cameraX * w * 0.035, cameraY * h * 0.024);
    let turn = cameraX * 0.035;
    var paneCenter = array<vec2f, 4>(vec2f(w * 0.71, h * 0.02), vec2f(w * 0.66, h * 0.98),
      vec2f(w * 0.82 + shimmer, h * 0.19), vec2f(w * 0.52 - shimmer * 0.55, h * 0.82));
    var paneShape = array<vec3f, 4>(vec3f(shortSide * 0.54, 1.42, 0.34),
      vec3f(shortSide * 0.58, 1.56, 0.3), vec3f(shortSide * 0.31, 0.58, 1.38),
      vec3f(shortSide * 0.28, 0.72, 1.18));
    var paneColor = array<vec3f, 4>(bright.rgb, cyan.rgb, violet.rgb, bright.rgb);
    var paneAlpha = array<f32, 4>(0.075, 0.085, 0.05, 0.045);
    for (var i = 0; i < 4; i++) {
      let d = px - paneCenter[i] - drift;
      let local = vec2f(cos(turn) * d.x + sin(turn) * d.y, -sin(turn) * d.x + cos(turn) * d.y)
        / paneShape[i].yz;
      let r = length(local) / paneShape[i].x;
      let ramp = select(select(select(0.0, mix(0.08, 0.0, (r - 0.72) / 0.28), r < 1.0),
        mix(0.46, 0.08, (r - 0.32) / 0.4), r < 0.72), mix(1.0, 0.46, r / 0.32), r < 0.32);
      let a = clamp(paneAlpha[i] * activeMedia * ramp * layerAlpha, 0.0, 1.0);
      let c = paneColor[i] * a;
      color = c + color - c * color;
      alpha = a + alpha - a * alpha;
    }

    // Source bloom: bright core into cyan and a faint violet edge.
    {
      let d = (px - vec2f(w * (0.69 + cameraX * 0.012), h * (0.5 + cameraY * 0.008)))
        / vec2f(1.55, 0.72);
      let r = length(d) / (shortSide * 0.34);
      var stop = vec4f(violet.rgb, 0.0);
      if (r < 0.16) {
        stop = mix(vec4f(bright.rgb, 0.22), vec4f(cyan.rgb, 0.13), r / 0.16);
      } else if (r < 0.45) {
        stop = mix(vec4f(cyan.rgb, 0.13), vec4f(violet.rgb, 0.05), (r - 0.16) / 0.29);
      } else if (r < 1.0) {
        stop = mix(vec4f(violet.rgb, 0.05), vec4f(violet.rgb, 0.0), (r - 0.45) / 0.55);
      }
      let a = clamp(stop.a * themeScale * layerAlpha * (1.0 - voice), 0.0, 1.0);
      let c = stop.rgb * a;
      color = c + color - c * color;
      alpha = a + alpha - a * alpha;
    }

    // Shafts: four offset glow lobes each, as the Canvas sprites.
    if (themeScale > 0.001) {
      var tops = array<f32, 13>(0.58, 0.5, 0.4, 0.28, 0.16, 0.21, 0.1, 0.17, 0.25, 0.33, 0.41, 0.51, 0.6);
      let lean = cameraX * w * 0.006;
      for (var band = 0; band < 13; band++) {
        let b = f32(band);
        let fromCenter = abs(b - 6.0) / 6.0;
        let pressure = audioIntent * (0.018 + sin(clock * 2.15 - b * 0.72) * 0.014
          + sin(clock * 0.83 + b * 0.41) * 0.008);
        let halfHeight = max(1.0, h * (0.13 + max(0.0, 0.6 - tops[band]) * 0.62 + pressure
          + (1.0 - fromCenter) * audioIntent * 0.018));
        let centerX = w * (0.405 + b * 0.0445) + cameraX * w * 0.018 * (0.55 + b / 18.0);
        let centerY = h * 0.495 + cameraY * h * 0.012 * (0.38 + fromCenter * 0.32);
        let shaftWidth = w * (0.018 + (1.0 - fromCenter) * 0.01 + select(0.0, 0.004, band % 3 == 0));
        if (abs(px.x - centerX) > shaftWidth * 3.8 + abs(lean) * 2.0 + 2.0) { continue; }
        let shaftColor = select(select(bright.rgb, violet.rgb, band > 8), cyan.rgb, band < 4);
        // Voice hands the shaft light to the volumetric curtains.
        let shaftAlpha = (0.19 + (1.0 - fromCenter) * 0.17) * themeScale * layerAlpha
          * (1.0 - voice);
        // Faint upward density drift: the GPU-only volumetric cue.
        let density = 1.0 + medium * (0.6 * sin(px.y * 0.021 + clock * 0.55 + b * 1.3)
          + 0.4 * sin(px.y * 0.047 - clock * 0.31 + b * 2.1));
        var lobeOffset = array<f32, 4>(0.0,
          sin(clock * 0.23 + b * 1.7) * shaftWidth * 0.28,
          -shaftWidth * 0.27 + sin(clock * 0.17 + b) * shaftWidth * 0.11,
          shaftWidth * 0.33 + cos(clock * 0.19 + b * 0.8) * shaftWidth * 0.09);
        var lobeShape = array<vec3f, 4>(vec3f(3.25, 1.08, 0.5), vec3f(1.36, 0.98, 0.76),
          vec3f(0.54, 0.92, 0.32), vec3f(0.3, 0.84, 0.19));
        for (var lobe = 0; lobe < 4; lobe++) {
          let offset = lobeOffset[lobe];
          let x = centerX + offset + lean * (offset / shaftWidth + 0.28);
          let radiusX = max(0.012 * halfHeight, shaftWidth * lobeShape[lobe].x);
          let radiusY = halfHeight * lobeShape[lobe].y;
          let r = length(vec2f((px.x - x) / radiusX, (px.y - centerY) / radiusY));
          let ramp = select(select(select(select(0.0, mix(0.055, 0.0, (r - 0.82) / 0.18), r < 1.0),
            mix(0.28, 0.055, (r - 0.52) / 0.3), r < 0.82), mix(0.72, 0.28, (r - 0.18) / 0.34), r < 0.52),
            mix(1.0, 0.72, r / 0.18), r < 0.18);
          let a = clamp(shaftAlpha * lobeShape[lobe].z * ramp * density, 0.0, 1.0);
          let c = shaftColor * a;
          color = c + color - c * color;
          alpha = a + alpha - a * alpha;
        }
      }
    }

    // Voice curtains: the first WebGPU pass's medium, unchanged in layout,
    // colour and intensity. Twelve samples integrate softly lit fog along a
    // perspective ray through thirteen curtains (five broader ones on
    // phones). It is drawn in the host's uv space, as before.
    if (voice > 0.001 && lightTheme < 0.5) {
      let aspect = hostWidth / max(hostHeight, 1.0);
      let center = ${curtainCenterWGSL('mobile')};
      let p = (uv - center) * vec2f(aspect, 1.0);
      let camera = vec2f(cameraX, cameraY) * ${f(curtain.cameraShift)};
      let bandWidth = ${curtainBandWidthWGSL('mobile', 'aspect')};
      var radiance = vec3f(0.0);
      var transmittance = 1.0;
      for (var sample = 0; sample < ${curtain.samples}; sample++) {
        let z = ${f(curtain.sampleStart)} + (f32(sample) + 0.5) * ${f(curtain.sampleStep)};
        let q = vec3f(p * z / 4.0 + camera * (z - 4.0), z - 4.0);
        ${mediumLightWGSL}
        let depthEnvelope = exp(-q.z * q.z * ${f(curtain.depthFalloff)});
        let floorFog = exp(-pow((q.y - ${f(curtain.floorFog.y)}) / ${f(curtain.floorFog.height)}, 2.0))
          * exp(-pow(q.x / (aspect * ${f(curtain.floorFog.width)}), 2.0))
          * mix(${f(curtain.floorFog.desktop)}, ${f(curtain.floorFog.phone)}, mobile);
        let colorBand = band * 6.0 / bandRadius;
        let cyanWeight = 1.0 - smoothstep(${f(curtain.colorBands.cyanFrom)}, ${f(curtain.colorBands.cyanTo)}, colorBand);
        let violetWeight = smoothstep(${f(curtain.colorBands.violetFrom)}, ${f(curtain.colorBands.violetTo)}, colorBand);
        let shaftColor = mix(mix(bright.rgb, cyan.rgb, cyanWeight), violet.rgb, violetWeight);
        let curtainColor = mix(shaftColor, bright.rgb, ridge * ${f(curtain.ridgeWhite)});
        let density = (illumination * ${f(curtain.illuminationGain)} + floorFog) * depthEnvelope;
        radiance += transmittance * ${f(curtain.scatter)} * density * curtainColor;
        transmittance *= exp(-density * ${f(curtain.extinction)});
      }
      // Optional guard keeping the curtains out of the measured Hero copy.
      let copyFade = 1.0 - copyInside * 0.9 * copyGuard;
      let energy = (vec3f(1.0) - exp(-radiance * ${f(curtain.exposure)})) * voice * layerAlpha * copyFade;
      let a = clamp(max(energy.r, max(energy.g, energy.b)), 0.0, ${f(curtain.maxAlpha)});
      color = energy + color - energy * color;
      alpha = a + alpha - a * alpha;
    }

    let shown = alpha * present;
    return vec4f(color / max(alpha, 0.0001), shown);
  `),
});

export function heroParticleUniforms() {
  // Keep the library's color-transform identity: its bridge converts CSS colors
  // to the GPU vector schema, rather than the CPU-only RGBA representation.
  const entries = Object.entries(heroParticleShader.props);
  return createGpuUniformsMap(
    // The bridge declaration erases each prop's input type to unknown; the
    // runtime consumes the same definition with its own typed default values.
    heroParticleShader as Parameters<typeof createGpuUniformsMap>[0],
    Object.fromEntries(entries.map(([name, config]) => [name, config.default])),
    'hero',
  );
}
