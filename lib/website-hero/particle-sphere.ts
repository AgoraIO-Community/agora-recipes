/**
 * Shared particle math for Agora's live-voice particle sphere.
 *
 * The homepage hero field (`RealtimeField`) and the Ask Agora `VoiceOrb` both
 * render the same two-layer sphere: the inner layer carries the visitor's
 * voice and the outer layer carries the agent's voice. Everything here is
 * pure and DOM-free except `cssRgb`/`readParticlePalette`, so the geometry is
 * unit-testable and identical wherever it is drawn.
 */

export const TAU = Math.PI * 2;

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smoothstep(minimum: number, maximum: number, value: number) {
  const progress = clamp((value - minimum) / (maximum - minimum));
  return progress * progress * (3 - 2 * progress);
}

export function fract(value: number) {
  return value - Math.floor(value);
}

/** Frame-rate independent exponential approach toward `target`. */
export function ease(current: number, target: number, rate: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

/** Deterministic hash noise in [0, 1). */
export function random(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/** Deterministic standard-normal sample (Box-Muller over `random`). */
export function gaussian(seedA: number, seedB: number) {
  const u = Math.max(0.0001, random(seedA));
  const v = random(seedB);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

/** Reads an `r, g, b` custom property, falling back when it is undefined. */
export function cssRgb(
  name: string,
  fallback: string,
  element: Element = document.documentElement,
) {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

export type ParticlePalette = {
  neutral: string;
  bright: string;
  cyan: string;
  violet: string;
};

/** Fallbacks used when the particle custom properties are not in scope. */
export const PARTICLE_PALETTE_FALLBACK: Readonly<ParticlePalette> = {
  neutral: '135, 157, 187',
  bright: '221, 234, 248',
  cyan: '74, 190, 225',
  violet: '138, 113, 221',
};

export function readParticlePalette(element?: Element): ParticlePalette {
  return {
    neutral: cssRgb('--particle-rgb', PARTICLE_PALETTE_FALLBACK.neutral, element),
    bright: cssRgb('--particle-bright-rgb', PARTICLE_PALETTE_FALLBACK.bright, element),
    cyan: cssRgb('--field-cyan-rgb', PARTICLE_PALETTE_FALLBACK.cyan, element),
    violet: cssRgb('--field-violet-rgb', PARTICLE_PALETTE_FALLBACK.violet, element),
  };
}

/** The per-particle seeds the sphere layout reads. */
export type SphereParticle = {
  /** -1 = inner (visitor) layer, 1 = outer (agent) layer. */
  side: -1 | 1;
  seed: number;
  sphereTheta: number;
  sphereZ: number;
  sphereRadialSeed: number;
  sphereLayerSeed: number;
  hueSeed: number;
};

/** Deterministic sphere seeds for particle `index`, as seeded by the hero field. */
export function createSphereParticle(index: number): SphereParticle {
  const seed = random(index * 21.73 + 3.5);
  return {
    // The inner sphere is about 42% of the outer radius. Allocate by
    // projected surface area so it reads as a scaled copy, not a dense core.
    side: seed > 0.84 ? -1 : 1,
    seed,
    sphereTheta: random(index * 5.13 + 7.2) * TAU,
    sphereZ: random(index * 9.71 + 1.8) * 2 - 1,
    sphereRadialSeed: random(index * 11.33 + 4.4),
    sphereLayerSeed: random(index * 17.41 + 9.7),
    hueSeed: random(index * 3.93 + 7.4),
  };
}

/** Palette slot for a sphere particle: 0 = bright, 1 = cyan, 2 = violet. */
export function sphereHue(hueSeed: number, wave: number): 0 | 1 | 2 {
  if (wave > 0.18) return 0;
  return hueSeed < 0.58 ? 0 : hueSeed < 0.86 ? 1 : 2;
}

/** Everything the sphere layout reads besides the particle itself. */
export type SphereFrame = {
  centerX: number;
  centerY: number;
  outerRadius: number;
  /** Seconds. */
  time: number;
  reducedMotion: boolean;
  /** Live voice (speaker-driven) versus the alternating preview pulse. */
  live: boolean;
  /** Preview strength; only read when `live` is false. */
  strength: number;
  /** Eased audio envelope, 0..1. */
  audio: number;
  /** Eased visitor-speaking strength, 0..1. */
  userStrength: number;
  /** Eased agent-speaking strength, 0..1. */
  aiStrength: number;
  /** Camera parallax, roughly -1..1. */
  cameraX: number;
  cameraY: number;
  /** Optional extra rotation in radians added to the shared drift. */
  spin?: number;
};

export type SpherePoint = { x: number; y: number; wave: number };

/** Projected 2D target for one particle of the two-layer voice sphere. */
export function spherePoint(particle: SphereParticle, frame: SphereFrame): SpherePoint {
  const { time, live, audio, userStrength, aiStrength } = frame;
  const isInner = particle.side < 0;
  const baseRadius = frame.outerRadius * (isInner ? 0.49 : 1);
  // Both layers share a direction and nearly-static angular drift. The
  // result reads as one volume, not two mechanisms rotating against each
  // other.
  const angularDrift = frame.reducedMotion
    ? 0
    : time * 0.045 + Math.sin(time * 0.19 + particle.seed * 9) * 0.018;
  const theta =
    frame.spin === undefined
      ? particle.sphereTheta + angularDrift
      : particle.sphereTheta + angularDrift + frame.spin;
  const z = particle.sphereZ;
  const radialSeed = particle.sphereRadialSeed;
  const layerSeed = particle.sphereLayerSeed;
  const shellRadius = isInner ? 0.61 + radialSeed ** 0.7 * 0.44 : 0.74 + radialSeed ** 0.62 * 0.26;
  const volumeRadius = Math.cbrt(radialSeed);
  // The inner layer has a softer edge than the outer shell. It remains
  // sphere-like, but dissolves into the shared volume instead of drawing a
  // second circular boundary.
  const radial = layerSeed < (isInner ? 0.56 : 0.7) ? shellRadius : volumeRadius;
  const projected = Math.sqrt(Math.max(0, 1 - z * z));

  const previewTurn = Math.sin(time * 1.42 + (isInner ? 0 : Math.PI)) * 0.5 + 0.5;
  const liveSpeaker = isInner ? userStrength + aiStrength * 0.08 : aiStrength + userStrength * 0.14;
  const speaker = live
    ? 0.2 + liveSpeaker * 0.8
    : smoothstep(0.18, 0.82, previewTurn) * frame.strength;
  const energy = live ? (isInner ? 0.3 + audio * 0.7 : 0.25 + audio * 0.75) : 0.82;
  const waveProgress = fract(time * (isInner ? 0.52 : 0.38) + (isInner ? 0.16 : 0.62));
  const waveDistance = Math.abs(radial - waveProgress);
  const waveFront = Math.exp(-(waveDistance * waveDistance) / 0.012) * speaker * energy;
  const surfaceWave =
    Math.sin(theta * 2.4 + z * 4.6 - time * (isInner ? 2.05 : 1.72)) * speaker * energy;
  const breath =
    1 +
    (live ? audio * (isInner ? userStrength : aiStrength) * 0.12 : 0) +
    Math.sin(time * 2.15 + (isInner ? 0 : 0.7)) * speaker * (isInner ? 0.064 : 0.052) +
    surfaceWave * (isInner ? 0.034 : 0.027) +
    waveFront * (isInner ? 0.07 : 0.048);
  const radius = baseRadius * radial * breath;
  const cameraParallaxX = frame.cameraX * z * baseRadius * 0.12;
  const cameraParallaxY = frame.cameraY * z * baseRadius * 0.09;

  return {
    x: frame.centerX + Math.cos(theta) * projected * radius + cameraParallaxX,
    y: frame.centerY + Math.sin(theta) * projected * radius + cameraParallaxY,
    wave: waveFront,
  };
}
