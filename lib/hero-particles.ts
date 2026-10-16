/** Deterministic seeds keep the same motes through every formation and resize. */
export const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value))

export function random(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function createParticle(index: number, count: number) {
  const seed = random(index * 21.73 + 3.5)
  return {
    seed,
    band: index % 13,
    spread: random(index * 7.91 + 4.7),
    offset: random(index * 3.17 + 1.2) - 0.5,
    depth: random(index * 13.13 + 9.4),
    angle: index * 2.399963229728653,
    latitude: 1 - 2 * ((index + 0.5) / count),
    inner: seed > 0.84,
    hue: random(index * 3.93 + 7.4),
  }
}

export type HeroParticle = ReturnType<typeof createParticle>
