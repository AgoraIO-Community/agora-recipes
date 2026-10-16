import { createSphereParticle, gaussian, random } from './particle-sphere';

/**
 * Seeds shared by the Canvas Hero field and its WebGPU renderer. Both draw
 * the same particle identities, so group mix, depth, size and alpha ranges
 * cannot drift between the approved Canvas benchmark and the GPU path.
 */
export type FieldParticleSeed = {
  u: number;
  v: number;
  depth: number;
  size: number;
  alpha: number;
  seed: number;
  /** 0 = right-weighted floor field, 1 = shaft/formation motes, 2 = suspended media. */
  group: 0 | 1 | 2;
  band: number;
  side: -1 | 1;
  audioJitter: number;
  videoLocalX: number;
  videoLocalY: number;
  sphereTheta: number;
  sphereZ: number;
  sphereRadialSeed: number;
  sphereLayerSeed: number;
  hueSeed: number;
  reflectionSeed: number;
};

/** Vertical extent of each of the thirteen Voice shafts, left to right. */
export const fieldShaftTops = [
  0.58, 0.5, 0.4, 0.28, 0.16, 0.21, 0.1, 0.17, 0.25, 0.33, 0.41, 0.51, 0.6,
] as const;

const bandCenters = [
  0.4, 0.445, 0.49, 0.535, 0.58, 0.625, 0.67, 0.715, 0.76, 0.805, 0.85, 0.895, 0.94,
] as const;

export const fieldMaxParticles = 9000;

export function fieldParticleCount(width: number, lowPower: boolean) {
  if (width < 680) return lowPower ? 2400 : 3600;
  if (lowPower) return 5200;
  return width > 1500 ? 9000 : 7200;
}

export function createFieldParticleSeed(index: number): FieldParticleSeed {
  const a = random(index * 3.17 + 1.2);
  const b = random(index * 7.91 + 4.7);
  const c = random(index * 13.13 + 9.4);
  const d = random(index * 21.73 + 3.5);
  const selector = index % 100;
  const group: 0 | 1 | 2 = selector < 38 ? 0 : selector < 94 ? 1 : 2;
  const band = index % 13;

  let u = a;
  let v = b;

  if (group === 0) {
    const rightBias = d < 0.72;
    u = rightBias ? 0.22 + a ** 0.74 * 0.88 : 0.02 + a ** 0.88 * 1.03;
    v = 0.64 + b ** 0.5 * 0.38 + gaussian(index + 0.9, index * 1.7) * 0.012;
  } else if (group === 1) {
    u = bandCenters[band] + gaussian(index + 18.2, index * 2.1) * (0.022 + c * 0.016);
    v = b;
  } else {
    // Sparse suspended media belongs to the "ceiling" and "floor" of the
    // volume. Keeping the middle clear makes the camera feel enclosed in a
    // refractive room without turning the background into a star field.
    const ceiling = d < 0.46;
    u = 0.16 + a ** 0.78 * 0.92;
    v = ceiling ? 0.035 + b ** 1.72 * 0.23 : 0.73 + b ** 1.65 * 0.3;
  }

  const depth = 0.1 + c * 0.9;
  const sphere = createSphereParticle(index);
  return {
    u,
    v,
    depth,
    size: group === 2 ? 0.55 + depth * 1.15 : 0.72 + depth * 1.72 + (index % 233 === 0 ? 1.15 : 0),
    alpha:
      group === 0 ? 0.18 + depth * 0.34 : group === 1 ? 0.28 + depth * 0.5 : 0.035 + depth * 0.09,
    seed: d,
    group,
    band,
    side: sphere.side,
    audioJitter: gaussian(index + 18.2, index * 2.1),
    videoLocalX: random(index * 6.41 + 2.6),
    videoLocalY: random(index * 8.73 + 5.1),
    sphereTheta: sphere.sphereTheta,
    sphereZ: sphere.sphereZ,
    sphereRadialSeed: sphere.sphereRadialSeed,
    sphereLayerSeed: sphere.sphereLayerSeed,
    hueSeed: sphere.hueSeed,
    reflectionSeed: random(index * 1.97 + 3.1) * 1.2,
  };
}
