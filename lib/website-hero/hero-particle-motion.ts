import type { shaderRendererGPU } from 'shaders/core';
import {
  curtainBandWidthWGSL,
  curtainCenterWGSL,
  mediumLightWGSL,
  voiceCurtainLayout,
  wgslFloat,
  lightThemeRendering,
} from './hero-field-light';
import { createFieldParticleSeed, fieldMaxParticles, fieldShaftTops } from './hero-field-model';

type GPUContext = NonNullable<
  ReturnType<ReturnType<typeof shaderRendererGPU>['getInternalRenderer']>
>;

/**
 * Per-frame field state, eased on the CPU exactly as the Canvas field eases
 * it. Positions are CSS pixels in the Canvas field's viewport-sized space,
 * anchored at the field's top-left corner.
 */
export type ParticleFrame = {
  width: number;
  height: number;
  pixelRatio: number;
  time: number;
  movement: number;
  audioIntent: number;
  videoIntent: number;
  conversationIntent: number;
  prepareIntent: number;
  liveStrength: number;
  userStrength: number;
  aiStrength: number;
  audio: number;
  cameraX: number;
  cameraY: number;
  cameraDepth: number;
  connect: number;
  exit: number;
  light: number;
  count: number;
  reduced: number;
  hostWidth: number;
  hostHeight: number;
};

const uniformFloats = 40;
const seedFloats = 20;

// Shared WGSL: a direct port of the Canvas field's target, colour, alpha and
// size rules (realtime-field.tsx and lib/particle-sphere.ts). The GPU keeps
// each particle's eased position in a storage buffer, so formations morph
// with the same per-particle lag as Canvas and resizes never reseed.
const commonWGSL = `
struct Uniforms {
  view: vec4f,   // width, height, pixel ratio, time
  m0: vec4f,     // movement, audioIntent, videoIntent, conversationIntent
  m1: vec4f,     // prepareIntent, liveStrength, userStrength, aiStrength
  m2: vec4f,     // audio, cameraX, cameraY, cameraDepth
  m3: vec4f,     // connect, exit, light, count
  m4: vec4f,     // reduced, probe wave scale, host width, host height
  neutral: vec4f,
  bright: vec4f,
  cyan: vec4f,
  violet: vec4f,
};
// a: u, v, depth, size; b: alpha, seed, group, band;
// c: side, audioJitter, videoLocalX, videoLocalY;
// d: sphereTheta, sphereZ, sphereRadialSeed, sphereLayerSeed; e: hueSeed, reflectionSeed.
struct Seed { a: vec4f, b: vec4f, c: vec4f, d: vec4f, e: vec4f };
struct Mote { shape: vec4f, color: vec4f };
const PI = 3.14159265;
const shaftTops = array<f32, 13>(${fieldShaftTops.join(', ')});

fn shaftSpan(band: f32, time: f32, amount: f32) -> f32 {
  var tops = shaftTops;
  let fromCenter = abs(band - 6.0) / 6.0;
  let base = 0.13 + max(0.0, 0.6 - tops[u32(band)]) * 0.62;
  let pressure = amount * (0.018 + sin(time * 2.15 - band * 0.72) * 0.014
    + sin(time * 0.83 + band * 0.41) * 0.008);
  return base + pressure + (1.0 - fromCenter) * amount * 0.018;
}
`;

const simulateWGSL = `${commonWGSL}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> seeds: array<Seed>;
@group(0) @binding(2) var<storage, read_write> positions: array<vec2f>;
@group(0) @binding(3) var<storage, read_write> motes: array<Mote>;
@group(0) @binding(4) var<storage, read_write> probePositions: array<vec4f>;

struct Shaft { centerX: f32, centerY: f32, topY: f32, floorY: f32, width: f32 };
fn shaftAt(band: f32) -> Shaft {
  let w = u.view.x;
  let h = u.view.y;
  let fromCenter = abs(band - 6.0) / 6.0;
  let centerY = h * 0.495 + u.m2.z * h * 0.012 * (0.38 + fromCenter * 0.32);
  let halfSpan = h * shaftSpan(band, u.view.w, u.m0.y);
  let accent = select(0.0, 0.004, u32(band) % 3u == 0u);
  return Shaft(w * (0.405 + band * 0.0445) + u.m2.y * w * 0.018 * (0.55 + band / 18.0),
    centerY, centerY - halfSpan, centerY + halfSpan, w * (0.018 + (1.0 - fromCenter) * 0.01 + accent));
}
fn shaftExposure(x: f32, y: f32) -> f32 {
  let first = shaftAt(0.0).centerX;
  let last = shaftAt(12.0).centerX;
  let spacing = (last - first) / 12.0;
  let nearest = clamp(round((x - first) / max(1.0, spacing)), 0.0, 12.0);
  var exposure = 0.0;
  for (var band = max(0.0, nearest - 1.0); band <= min(12.0, nearest + 1.0); band += 1.0) {
    let s = shaftAt(band);
    let t = clamp((y - s.topY) / max(1.0, s.floorY - s.topY), 0.0, 1.0);
    let centerX = s.centerX + u.m2.y * u.view.x * 0.008 * (1.0 - t);
    let radius = s.width * (0.42 + t * 0.2);
    let vertical = smoothstep(0.0, 0.13, t) * (1.0 - smoothstep(0.86, 1.0, t));
    exposure = max(exposure, (1.0 - smoothstep(radius * 0.18, radius, abs(x - centerX))) * vertical);
  }
  return exposure;
}
fn project(pu: f32, pv: f32, depth: f32) -> vec2f {
  let perspective = 0.78 + depth * (0.44 + u.m2.w * 0.16);
  return vec2f(u.view.x * (0.68 + (pu - 0.68) * perspective + u.m2.y * (depth - 0.24) * 0.04),
    u.view.y * (0.58 + (pv - 0.58) * perspective + u.m2.z * (depth - 0.24) * 0.031));
}
fn flowDepth(s: Seed, time: f32) -> f32 {
  let speed = select(select(0.014, 0.052, s.b.z == 1.0), 0.026, s.b.z == 0.0);
  return fract(s.a.z + s.b.y * 0.37 + time * speed);
}
fn depthFade(depth: f32) -> f32 {
  return smoothstep(0.02, 0.14, depth) * (1.0 - smoothstep(0.84, 0.995, depth));
}
fn baseTarget(s: Seed, time: f32) -> vec2f {
  let depth = s.a.z;
  let seed = s.b.y;
  let moving = flowDepth(s, time);
  if (s.b.z == 0.0) {
    let ripple = sin(s.a.x * 13.5 + depth * 4.2 - time * 0.32 + seed * 3.0) * (0.006 + depth * 0.012);
    return project(s.a.x, s.a.y + ripple, moving);
  }
  if (s.b.z == 1.0) {
    let halfSpan = shaftSpan(s.b.w, time, 0.0);
    let plumeY = 0.495 - halfSpan + pow(clamp(s.a.y, 1e-6, 1.0), 0.92) * halfSpan * 2.0
      + sin(s.a.y * 5.8 + seed * 8.0 + time * (0.18 + depth * 0.08)) * (0.006 + depth * 0.009);
    let plumeX = s.a.x + sin(time * 0.13 + seed * 14.0) * (0.003 + depth * 0.006);
    return project(plumeX, plumeY, moving);
  }
  return project(s.a.x + sin(time * 0.08 + seed * 17.0) * (0.003 + depth * 0.007),
    s.a.y + cos(time * 0.075 + seed * 13.0) * (0.002 + depth * 0.006), moving);
}
// Voice: the first WebGPU pass's curtain layout, in the host's uv space.
struct Curtains { center: vec2f, aspect: f32, mobile: f32, bandWidth: f32 };
fn curtains() -> Curtains {
  let host = max(u.m4.zw, vec2f(1.0));
  let mobile = select(0.0, 1.0, host.x <= ${wgslFloat(voiceCurtainLayout.phoneMaxWidth)});
  let aspect = host.x / host.y;
  return Curtains(${curtainCenterWGSL('mobile')}, aspect, mobile,
    ${curtainBandWidthWGSL('mobile', 'aspect')});
}
fn curtainLight(position: vec2f) -> f32 {
  let c = curtains();
  let aspect = c.aspect;
  let mobile = c.mobile;
  let bandWidth = c.bandWidth;
  let q = vec3f((position / max(u.m4.zw, vec2f(1.0)) - c.center) * vec2f(aspect, 1.0), 0.0);
  let clock = u.view.w;
  let amplitude = u.m2.x;
  ${mediumLightWGSL}
  return clamp(illumination, 0.0, 1.0);
}
// Shaft motes gather in the curtains: thirteen bands, or five on phones.
fn curtainTarget(s: Seed, time: f32) -> vec2f {
  let c = curtains();
  let count = mix(13.0, 5.0, c.mobile);
  let band = select(s.b.w, floor(s.b.w * 5.0 / 13.0), c.mobile > 0.5) - (count - 1.0) * 0.5;
  let span = 0.095 + exp(-pow(band / mix(5.0, 1.8, c.mobile), 2.0)) * 0.29;
  var q = vec2f(band * c.bandWidth + s.c.y * c.bandWidth * 0.42, 0.055 + (s.a.y * 2.0 - 1.0) * span);
  q += vec2f(sin(q.y * 9.0 + s.b.y * 6.28 + time * 0.48) * 0.018,
    cos(q.x * 8.0 + s.d.x + time * 0.39) * 0.016 + sin(time * 0.63 + s.a.x * 8.0) * 0.011);
  let z = (flowDepth(s, time) - 0.5) * 1.7;
  let projected = q * 4.0 / (4.0 + z) + vec2f(u.m2.y, u.m2.z) * z * 0.05;
  return (c.center + projected / vec2f(c.aspect, 1.0)) * u.m4.zw;
}
fn videoTarget(s: Seed, index: u32) -> vec2f {
  let w = u.view.x;
  let h = u.view.y;
  let mobile = w < 680.0;
  let cell = index % 40u;
  let column = f32(cell % 8u);
  let row = f32(cell / 8u);
  let cellSize = min(w * select(0.061, 0.092, mobile), h * select(0.092, 0.074, mobile));
  let gap = cellSize * 0.14;
  let tile = cellSize - gap;
  let localX = -cellSize * 4.0 + column * cellSize + gap * 0.5 + s.c.z * tile;
  let localY = -cellSize * 2.5 + row * cellSize + gap * 0.5 + s.c.w * tile;
  return vec2f(w * select(0.7, 0.62, mobile) + localX + localY * u.m2.y * 0.055 + u.m2.y * w * 0.018,
    h * select(0.43, 0.41, mobile) + localY + localX * u.m2.z * 0.045 + u.m2.z * h * 0.014);
}
// Port of lib/particle-sphere.ts spherePoint. waveScale only exists for the
// audit probe, which compares the same pose with and without the wave front.
fn spherePoint(s: Seed, time: f32, strength: f32, live: bool, waveScale: f32) -> vec4f {
  let w = u.view.x;
  let h = u.view.y;
  let mobile = w < 680.0;
  let center = vec2f(w * select(0.715, 0.63, mobile), h * select(0.42, 0.43, mobile));
  let outerRadius = min(w, h) * select(select(0.265, 0.285, live), 0.22, mobile);
  let isInner = s.c.x < 0.0;
  let audio = u.m2.x;
  let user = u.m1.z;
  let ai = u.m1.w;
  let baseRadius = outerRadius * select(1.0, 0.49, isInner);
  let drift = select(time * 0.045 + sin(time * 0.19 + s.b.y * 9.0) * 0.018, 0.0, u.m4.x > 0.5);
  let theta = s.d.x + drift;
  let z = s.d.y;
  let radialSeed = s.d.z;
  let shellRadius = select(0.74 + pow(radialSeed, 0.62) * 0.26,
    0.61 + pow(radialSeed, 0.7) * 0.44, isInner);
  let radial = select(pow(radialSeed, 1.0 / 3.0), shellRadius, s.d.w < select(0.7, 0.56, isInner));
  let projected = sqrt(max(0.0, 1.0 - z * z));
  let previewTurn = sin(time * 1.42 + select(PI, 0.0, isInner)) * 0.5 + 0.5;
  let liveSpeaker = select(ai + user * 0.14, user + ai * 0.08, isInner);
  let speaker = select(smoothstep(0.18, 0.82, previewTurn) * strength, 0.2 + liveSpeaker * 0.8, live);
  let energy = select(0.82, select(0.25 + audio * 0.75, 0.3 + audio * 0.7, isInner), live);
  let progress = fract(time * select(0.38, 0.52, isInner) + select(0.62, 0.16, isInner));
  let waveDistance = abs(radial - progress);
  let waveFront = exp(-(waveDistance * waveDistance) / 0.012) * speaker * energy * waveScale;
  let surfaceWave = sin(theta * 2.4 + z * 4.6 - time * select(1.72, 2.05, isInner)) * speaker * energy;
  let breath = 1.0 + select(0.0, audio * select(ai, user, isInner) * 0.12, live)
    + sin(time * 2.15 + select(0.7, 0.0, isInner)) * speaker * select(0.052, 0.064, isInner)
    + surfaceWave * select(0.027, 0.034, isInner) + waveFront * select(0.048, 0.07, isInner);
  let radius = baseRadius * radial * breath;
  return vec4f(center.x + cos(theta) * projected * radius + u.m2.y * z * baseRadius * 0.12,
    center.y + sin(theta) * projected * radius + u.m2.z * z * baseRadius * 0.09, waveFront, radius);
}
struct Goal { position: vec2f, throughField: f32, sphereWave: f32 };
fn fieldGoal(s: Seed, index: u32, time: f32) -> Goal {
  var p = baseTarget(s, time);
  var wave = 0.0;
  if (s.b.z == 1.0) {
    let audioIntent = u.m0.y;
    let videoIntent = u.m0.z;
    if (audioIntent > 0.001) { p += (curtainTarget(s, time) - p) * audioIntent; }
    if (videoIntent > 0.001) { p += (videoTarget(s, index) - p) * videoIntent; }
    let sphereStrength = max(u.m0.w, u.m1.x);
    if (sphereStrength > 0.001) {
      let sphere = spherePoint(s, time, sphereStrength, false, 1.0);
      p += (sphere.xy - p) * sphereStrength;
      wave = max(wave, sphere.z * sphereStrength);
    }
    let liveStrength = u.m1.y;
    if (liveStrength > 0.001) {
      let sphere = spherePoint(s, time, 1.0, true, 1.0);
      p += (sphere.xy - p) * liveStrength;
      wave = max(wave, sphere.z * liveStrength);
    }
  }
  let throughField = sin(u.m1.y * PI) * u.m3.x;
  if (throughField > 0.001 && s.b.z != 0.0) {
    let zoomCenter = vec2f(u.view.x * 0.68, u.view.y * 0.5);
    p = zoomCenter + (p - zoomCenter) * (1.0 + throughField * (0.25 + s.a.z * 1.25));
  }
  let exit = u.m3.y;
  if (exit > 0.001) {
    let spread = 0.45 + s.a.z * 0.55;
    p.x += select(1.0, -1.0, p.x < u.view.x * 0.56) * u.view.x * exit * 0.035 * spread;
    p.y += select(1.0, -1.0, p.y < u.view.y * 0.52) * u.view.y * exit * 0.028 * spread;
    p.y -= u.view.y * exit * (0.01 + s.a.z * 0.014);
  }
  return Goal(p, throughField, wave);
}

@compute @workgroup_size(64) fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let index = gid.x;
  if (index >= arrayLength(&positions)) { return; }
  let s = seeds[index];
  let time = u.view.w;
  let goal = fieldGoal(s, index, time);
  let position = positions[index] + (goal.position - positions[index]) * u.m0.x;
  positions[index] = position;
  if (f32(index) >= u.m3.w) {
    motes[index] = Mote(vec4f(0.0), vec4f(0.0));
    return;
  }

  let audioIntent = u.m0.y;
  let videoIntent = u.m0.z;
  let kind = s.b.z;
  let depth = s.a.z;
  let titleDistance = length(vec2f((position.x - u.view.x * 0.23) / (u.view.x * 0.4),
    (position.y - u.view.y * 0.69) / (u.view.y * 0.34)));
  let titleAttenuation = 1.0 - (1.0 - smoothstep(0.48, 1.15, titleDistance)) * 0.68;
  // Voice motes catch the curtains' light; other modes use the Canvas shafts.
  let exposure = mix(shaftExposure(position.x, position.y), curtainLight(position), audioIntent)
    * select(1.0, 0.35, kind == 2.0);
  let sphereMode = max(max(u.m0.w, u.m1.x), u.m1.y);
  let suppression = clamp(max(videoIntent, sphereMode), 0.0, 1.0);
  let visibleExposure = exposure * (1.0 - suppression * 0.94) * (1.0 + audioIntent * 0.4);
  let user = u.m1.z;
  let ai = u.m1.w;
  let sideSpeaking = select(ai + user * 0.14, user + ai * 0.08, s.c.x < 0.0);
  let cell = index % 40u;
  let row = cell / 8u;
  let column = cell % 8u;
  let phase = time * 0.48 + f32(column) * 0.91 + f32(row) * 1.27 + s.e.y;
  let reflection = videoIntent
    * pow(clamp(0.5 + sin(phase) * 0.28 + sin(phase * 0.43 + 1.7) * 0.22, 0.0, 1.0), 3.2);
  let videoVisibility = 1.0 - videoIntent * select(0.48, 0.0, index % 3u == 0u);

  var color = select(select(u.neutral.rgb, u.cyan.rgb, depth > 0.64), u.bright.rgb,
    kind == 1.0 && depth > 0.58);
  if (visibleExposure > 0.16) { color = u.bright.rgb; }
  if (videoIntent > 0.1) {
    color = select(u.cyan.rgb, u.neutral.rgb, (row + column) % 2u == 1u);
    if (reflection > 0.34) { color = u.bright.rgb; }
  }
  if (sphereMode > 0.08) {
    let hue = s.e.x;
    color = select(select(u.violet.rgb, u.cyan.rgb, hue < 0.86), u.bright.rgb,
      goal.sphereWave > 0.18 || hue < 0.58);
  }

  let moving = flowDepth(s, time);
  let shapeMode = select(0.0, max(videoIntent, sphereMode), kind == 1.0);
  let environment = clamp(0.12 + videoIntent * 0.48 + sphereMode * 0.56, 0.0, 1.0);
  let mediaLift = select(1.0, 1.0 + environment * 1.45, kind == 2.0);
  let visualDepth = moving + (depth - moving) * shapeMode;
  let outwardFade = depthFade(moving) + (1.0 - depthFade(moving)) * shapeMode;
  let alpha = s.b.x * select(1.0, ${wgslFloat(lightThemeRendering.particleOpacity)}, u.m3.z > 0.5) * titleAttenuation * outwardFade
    * videoVisibility * mediaLift
    * (0.62 + visualDepth * 0.28 + visibleExposure * 0.96 + reflection * 0.78
      + sideSpeaking * sphereMode * 0.12 + goal.sphereWave * 0.42)
    * (1.0 - smoothstep(0.6, 1.0, u.m3.y) * 0.93);
  let size = s.a.w * (0.68 + visualDepth * 0.7) * select(1.0, 1.0 + environment * 0.18, kind == 2.0)
    * (1.0 + visibleExposure * 0.26 + goal.throughField * 0.5 + reflection * 0.34
      + sideSpeaking * sphereMode * 0.1 + goal.sphereWave * 0.44);
  var halo = 0.0;
  if (videoIntent > 0.16 && reflection > 0.24 && index % 11u == 0u) {
    halo = min(0.16, alpha * reflection * 0.34);
  }
  motes[index] = Mote(vec4f(position, size, min(0.96, alpha)), vec4f(color, halo));
}

// Diagnostic entry for the local audit: idle AI sphere targets at a fixed
// clock, with the wave front scaled by m4.y, as 3D points in units of the
// outer radius. It shares spherePoint with rendering and runs only on the
// audit URL.
@compute @workgroup_size(64) fn probe(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x >= 512u) { return; }
  let s = seeds[gid.x * 17u + 3u];
  let w = u.view.x;
  let h = u.view.y;
  let mobile = w < 680.0;
  let center = vec2f(w * select(0.715, 0.63, mobile), h * select(0.42, 0.43, mobile));
  let outerRadius = min(w, h) * select(0.265, 0.22, mobile);
  let sphere = spherePoint(s, u.view.w, 1.0, false, u.m4.y);
  // Report the 3D point on the sphere: the screen offset plus its depth.
  let point = vec3f(sphere.xy - center, s.d.y * sphere.w) / outerRadius;
  probePositions[gid.x] = vec4f(point, sphere.z * select(0.0, 1.0, s.b.z == 1.0));
}
`;

const renderWGSL = `${commonWGSL}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(3) var<storage, read> motes: array<Mote>;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat) bounds: vec4f,
  @location(1) @interpolate(flat) color: vec4f,
  @location(2) @interpolate(flat) square: f32,
};
// Instances [0, n) are motes; [n, 2n) are the sparse Video reflection halos.
@vertex fn vertex(@builtin(vertex_index) vertexId: u32, @builtin(instance_index) instanceId: u32) -> VertexOutput {
  let count = arrayLength(&motes);
  let isHalo = instanceId >= count;
  let mote = motes[instanceId % count];
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));
  let ratio = u.view.z;
  let size = mote.shape.z;
  var alpha = mote.shape.w;
  var color = mote.color.rgb;
  var square = 0.0;
  // Circles: (center, radius) in device pixels. Squares: (min, max).
  var bounds = vec4f(mote.shape.xy * ratio, size * 0.5 * ratio, 0.0);
  if (isHalo) {
    alpha = mote.color.w;
    color = u.bright.rgb;
    bounds.z = size * 2.6 * ratio;
  } else if (size < 2.3) {
    // Canvas fills small motes as squares from their corner, not centered.
    square = 1.0;
    bounds = vec4f(mote.shape.xy * ratio, (mote.shape.xy + size) * ratio);
  }
  var lo = bounds.xy - bounds.z - 1.0;
  var hi = bounds.xy + bounds.z + 1.0;
  if (square > 0.5) {
    lo = bounds.xy - 1.0;
    hi = bounds.zw + 1.0;
  }
  if (alpha <= 0.0 || size <= 0.0) {
    lo = vec2f(-10.0);
    hi = vec2f(-10.0);
  }
  let pixel = mix(lo, hi, corners[vertexId]);
  let clip = pixel / (u.view.xy * ratio) * 2.0 - 1.0;
  return VertexOutput(vec4f(clip.x, -clip.y, 0.0, 1.0), bounds, vec4f(color, alpha), square);
}
@fragment fn fragment(in: VertexOutput) -> @location(0) vec4f {
  let pixel = in.position.xy;
  var coverage = 0.0;
  if (in.square > 0.5) {
    let overlap = clamp(min(in.bounds.zw, pixel + 0.5) - max(in.bounds.xy, pixel - 0.5),
      vec2f(0.0), vec2f(1.0));
    coverage = overlap.x * overlap.y;
  } else {
    coverage = clamp(in.bounds.z - distance(pixel, in.bounds.xy) + 0.5, 0.0, 1.0);
  }
  let alpha = in.color.a * coverage;
  return vec4f(in.color.rgb * alpha, alpha);
}
`;

export async function createHeroParticleLayer(gpu: GPUContext, canvas: HTMLCanvasElement) {
  const { device, root } = gpu;
  const context = root.configureContext({ canvas, colorSpace: 'srgb', alphaMode: 'premultiplied' });
  const buffers: { destroy(): void }[] = [];
  const buffer = (label: string, size: number, usage: number) => {
    const created = device.createBuffer({ label, size, usage });
    buffers.push(created);
    return created;
  };
  try {
    const format = context.getConfiguration()?.format;
    if (!format) throw new Error('Particle canvas has no GPU format');
    const simulateModule = device.createShaderModule({
      label: 'Hero field simulation',
      code: simulateWGSL,
    });
    const renderModule = device.createShaderModule({ label: 'Hero field motes', code: renderWGSL });
    const [simulate, probePipeline, pipeline] = await Promise.all([
      device.createComputePipelineAsync({
        label: 'Hero field simulation',
        layout: 'auto',
        compute: { module: simulateModule, entryPoint: 'simulate' },
      }),
      device.createComputePipelineAsync({
        label: 'Hero field probe',
        layout: 'auto',
        compute: { module: simulateModule, entryPoint: 'probe' },
      }),
      device.createRenderPipelineAsync({
        label: 'Hero field motes',
        layout: 'auto',
        vertex: { module: renderModule, entryPoint: 'vertex' },
        fragment: {
          module: renderModule,
          entryPoint: 'fragment',
          targets: [
            {
              format,
              // Premultiplied "screen", as the Canvas field composites on
              // dark: result = src + dst - src * dst.
              blend: {
                color: { srcFactor: 'one', dstFactor: 'one-minus-src', operation: 'add' },
                alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              },
            },
          ],
        },
        primitive: { topology: 'triangle-list' },
      }),
    ]);

    // WebGPU buffer usage flags. The Shaders API supplies the device types but
    // not the ambient browser constants: MAP_READ 0x01, COPY_SRC 0x04,
    // COPY_DST 0x08, UNIFORM 0x40, STORAGE 0x80.
    const uniform = buffer('Hero field uniforms', uniformFloats * 4, 0x40 | 0x08);
    const seeds = buffer('Hero field seeds', fieldMaxParticles * seedFloats * 4, 0x80 | 0x08);
    const positions = buffer('Hero field positions', fieldMaxParticles * 8, 0x80 | 0x08);
    const motes = buffer('Hero field motes', fieldMaxParticles * 32, 0x80);
    const probePositions = buffer('Hero field probe', 512 * 16, 0x80 | 0x04);

    const seedData = new Float32Array(fieldMaxParticles * seedFloats);
    for (let index = 0; index < fieldMaxParticles; index += 1) {
      const p = createFieldParticleSeed(index);
      seedData.set(
        [
          p.u,
          p.v,
          p.depth,
          p.size,
          p.alpha,
          p.seed,
          p.group,
          p.band,
          p.side,
          p.audioJitter,
          p.videoLocalX,
          p.videoLocalY,
          p.sphereTheta,
          p.sphereZ,
          p.sphereRadialSeed,
          p.sphereLayerSeed,
          p.hueSeed,
          p.reflectionSeed,
        ],
        index * seedFloats,
      );
    }
    device.queue.writeBuffer(seeds, 0, seedData);

    const simulateBindings = device.createBindGroup({
      layout: simulate.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniform } },
        { binding: 1, resource: { buffer: seeds } },
        { binding: 2, resource: { buffer: positions } },
        { binding: 3, resource: { buffer: motes } },
      ],
    });
    const renderBindings = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniform } },
        { binding: 3, resource: { buffer: motes } },
      ],
    });

    let disposed = false;
    let seeded = false;
    let lastUniforms = new Float32Array(uniformFloats);
    const pack = (frame: ParticleFrame, colors: number[]) =>
      new Float32Array([
        frame.width,
        frame.height,
        frame.pixelRatio,
        frame.time,
        frame.movement,
        frame.audioIntent,
        frame.videoIntent,
        frame.conversationIntent,
        frame.prepareIntent,
        frame.liveStrength,
        frame.userStrength,
        frame.aiStrength,
        frame.audio,
        frame.cameraX,
        frame.cameraY,
        frame.cameraDepth,
        frame.connect,
        frame.exit,
        frame.light,
        frame.count,
        frame.reduced,
        1,
        frame.hostWidth,
        frame.hostHeight,
        ...colors,
      ]);

    return {
      /** `visible` false clears the layer and holds positions, as Canvas does once the Hero has exited. */
      async render(frame: ParticleFrame, colors: number[], visible: boolean) {
        if (disposed) return;
        const width = Math.max(1, Math.round(frame.width * frame.pixelRatio));
        const height = Math.max(1, Math.round(frame.height * frame.pixelRatio));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        if (!seeded) {
          // Canvas starts every particle at one spawn point and lets them
          // ease out. Seed once; resizes keep existing positions.
          const spawn = new Float32Array(fieldMaxParticles * 2);
          for (let index = 0; index < fieldMaxParticles; index += 1) {
            spawn[index * 2] = frame.width * 0.68;
            spawn[index * 2 + 1] = frame.height * 0.58;
          }
          device.queue.writeBuffer(positions, 0, spawn);
          seeded = true;
        }
        const data = pack(frame, colors);
        lastUniforms = data;
        device.queue.writeBuffer(uniform, 0, data);
        const commands = device.createCommandEncoder();
        if (visible) {
          const compute = commands.beginComputePass();
          compute.setPipeline(simulate);
          compute.setBindGroup(0, simulateBindings);
          compute.dispatchWorkgroups(Math.ceil(fieldMaxParticles / 64));
          compute.end();
        }
        const pass = commands.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        if (visible) {
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, renderBindings);
          pass.draw(6, fieldMaxParticles * 2);
        }
        pass.end();
        device.queue.submit([commands.finish()]);
        await device.queue.onSubmittedWorkDone();
      },
      // Read real GPU sphere targets at a fixed idle AI pose without changing
      // the visible frame or creating a second animation loop.
      async probe(clock: number, motion: number) {
        if (disposed) throw new Error('Particle layer disposed');
        const data = new Float32Array(lastUniforms);
        data[3] = clock;
        data[12] = 0;
        data[13] = 0;
        data[14] = 0;
        data[20] = 0;
        data[21] = motion;
        const probeUniform = device.createBuffer({ size: uniformFloats * 4, usage: 0x40 | 0x08 });
        const readback = device.createBuffer({ size: 8192, usage: 0x01 | 0x08 });
        try {
          device.queue.writeBuffer(probeUniform, 0, data);
          const bindings = device.createBindGroup({
            layout: probePipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: probeUniform } },
              { binding: 1, resource: { buffer: seeds } },
              { binding: 4, resource: { buffer: probePositions } },
            ],
          });
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginComputePass();
          pass.setPipeline(probePipeline);
          pass.setBindGroup(0, bindings);
          pass.dispatchWorkgroups(8);
          pass.end();
          encoder.copyBufferToBuffer(probePositions, 0, readback, 0, 8192);
          device.queue.submit([encoder.finish()]);
          await readback.mapAsync(0x01);
          const values = new Float32Array(readback.getMappedRange().slice(0));
          readback.unmap();
          return Array.from({ length: 512 }, (_, index) => ({
            id: index * 17 + 3,
            position: Array.from(values.subarray(index * 4, index * 4 + 3)),
            wave: values[index * 4 + 3],
          }));
        } finally {
          probeUniform.destroy();
          readback.destroy();
        }
      },
      cleanup() {
        if (disposed) return;
        disposed = true;
        for (const created of buffers) created.destroy();
        context.unconfigure();
      },
    };
  } catch (error) {
    for (const created of buffers) created.destroy();
    context.unconfigure();
    throw error;
  }
}
