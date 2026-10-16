import { clamp, createParticle, type HeroParticle } from "./hero-particles"

export type HeroMode = 0 | 1 | 2

const HOLD_SECONDS = [4, 4, 6]
const MORPH_SECONDS = 0.7
const WAVE_HEIGHTS = [0.22, 0.34, 0.48, 0.66, 0.85, 0.94, 1, 0.91, 0.78, 0.61, 0.46, 0.32, 0.2]
const ALPHA_STEPS = 20

/**
 * A bounded Canvas renderer: cached light sprites, one active formation, and
 * a snapshot of the outgoing pose. No raymarching, pixel uploads, or React
 * state updates in the drawing loop. Animation time follows real elapsed time.
 */
export function createHeroRenderer(
  canvas: HTMLCanvasElement,
  onModeChange: (mode: HeroMode) => void,
  onMotionChange: (staticOnly: boolean) => void,
) {
  const context = canvas.getContext("2d", { alpha: true, desynchronized: true })
  const host = canvas.parentElement
  if (!context || !host) return null
  const ctx = context
  const motion = matchMedia("(prefers-reduced-motion: reduce)")
  const device = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const lowPower = (device.hardwareConcurrency || 8) <= 4 || (device.deviceMemory ?? 8) <= 4
  const saveData = !!device.connection?.saveData
  let reduced = motion.matches || saveData
  let paused = false
  try { paused = localStorage.getItem("agora-motion") === "paused" } catch {}

  let width = 1
  let height = 1
  let fieldHeight = 1
  let time = 0
  let modeAge = 0
  let mode: HeroMode = 0
  let manual = false
  let morphStarted = -MORPH_SECONDS
  let last = 0
  let frame = 0
  let visible = true
  let disposed = false
  let light = false
  let particles: HeroParticle[] = []
  let positions = new Float32Array(0)
  let outgoing = new Float32Array(0)
  let paint: string[][] = []
  let glows: HTMLCanvasElement[] = []
  const target = { x: 0, y: 0, depth: 0, energy: 0, hue: 0 }
  const waveHeights = new Float32Array(13)
  const tileEnergy = new Float32Array(40)

  function makeGlow(color: string) {
    const surface = document.createElement("canvas")
    surface.width = surface.height = 64
    const brush = surface.getContext("2d")!
    const gradient = brush.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, `rgba(${color},1)`)
    gradient.addColorStop(0.18, `rgba(${color},0.6)`)
    gradient.addColorStop(0.5, `rgba(${color},0.12)`)
    gradient.addColorStop(1, `rgba(${color},0)`)
    brush.fillStyle = gradient
    brush.fillRect(0, 0, 64, 64)
    return surface
  }

  function readTheme() {
    light = document.documentElement.dataset.theme === "light"
    const css = getComputedStyle(document.documentElement)
    const colors = ["--field-cyan-rgb", "--particle-bright-rgb", "--field-violet-rgb", "--particle-rgb"]
      .map(name => css.getPropertyValue(name).trim())
    // Cache all paint strings; the per-mote loop only selects an existing one.
    paint = colors.map(color => Array.from({ length: ALPHA_STEPS + 1 }, (_, index) =>
      `rgba(${color},${index / ALPHA_STEPS})`,
    ))
    glows = colors.map(makeGlow)
    syncPlayback()
  }

  function prepareFormation() {
    if (mode === 0) {
      for (let band = 0; band < 13; band++) {
        const pressure = 0.76 + 0.16 * Math.sin(time * 4.8 - band * 0.72)
          + 0.08 * Math.sin(time * 2.7 + band * 0.53)
        waveHeights[band] = fieldHeight * 0.94 * WAVE_HEIGHTS[band] * pressure
      }
    } else if (mode === 1) {
      for (let cell = 0; cell < 40; cell++) {
        const phase = time * 2.4 - (cell % 8) * 0.42 - Math.floor(cell / 8) * 0.58
        tileEnergy[cell] = Math.max(0, Math.sin(phase)) ** 6
      }
    }
  }

  function formation(p: HeroParticle, index: number) {
    const centerY = fieldHeight * 0.5
    target.hue = 0
    target.energy = 0
    target.depth = p.depth

    if (mode === 0) {
      const span = waveHeights[p.band]
      const flow = p.spread + time * (0.18 + p.seed * 0.12) * (p.band % 2 ? 1 : -1)
      const position = flow - Math.floor(flow)
      target.x = width * (0.12 + p.band * 0.063333) + p.offset * Math.min(12, width * 0.019)
      target.y = centerY + (position - 0.5) * span
      target.energy = Math.sin(position * Math.PI) * (0.35 + p.depth * 0.65)
      target.hue = p.band > 9 && p.hue > 0.6 ? 2 : p.depth > 0.72 ? 1 : 0
    } else if (mode === 1) {
      const cell = index % 40
      const column = cell % 8
      const row = Math.floor(cell / 8)
      const point = Math.floor(index / 40)
      const side = Math.ceil(Math.sqrt(particles.length / 40))
      const size = Math.min(width * 0.105, fieldHeight * 0.157)
      const jitter = p.offset * 0.15
      target.x = width * 0.5 + (column - 4 + 0.14 + ((point % side + 0.5 + jitter) / side) * 0.72) * size
      target.y = centerY + (row - 2.5 + 0.14 + ((Math.floor(point / side) + 0.5 + jitter) / side) * 0.72) * size
      target.energy = tileEnergy[cell]
      target.hue = target.energy > 0.6 ? 1 : (column + row) % 2 ? 3 : 0
    } else {
      const radius = Math.min(width * 0.29, fieldHeight * 0.46)
      const angle = p.angle + time * 0.28
      const horizontal = Math.sqrt(1 - p.latitude * p.latitude)
      const turn = time * 2.8 + (p.inner ? Math.PI : 0)
      const breath = 1 + Math.sin(turn) * (p.inner ? 0.065 : 0.035)
      const shell = p.inner ? 0.47 : 0.88 + p.depth * 0.12
      const x = Math.cos(angle) * horizontal * radius * shell * breath
      const z = Math.sin(angle) * horizontal
      const y = p.latitude * radius * shell * breath
      // A slight pitch keeps the two concentric layers readable as a volume.
      target.x = width * 0.5 + x
      target.y = centerY + y * 0.98 - z * radius * shell * 0.18
      target.depth = (z + 1) * 0.5
      target.energy = Math.max(0, Math.sin(turn - p.latitude * 3)) ** 8
      target.hue = p.hue > 0.9 ? 2 : target.depth > 0.72 ? 1 : 0
    }
  }

  function drawLight(amount: number) {
    if (mode === 0) {
      // Thin, cached shafts provide a luminous core without the old fog layer.
      for (let band = 0; band < 13; band++) {
        const x = width * (0.12 + band * 0.063333)
        const span = waveHeights[band]
        const glow = glows[band > 9 ? 2 : 0]
        const thickness = Math.max(5, width * 0.014)
        ctx.globalAlpha = amount * (light ? 0.28 : 0.7)
        ctx.drawImage(glow, x - thickness, fieldHeight * 0.5 - span * 0.56, thickness * 2, span * 1.12)
        ctx.globalAlpha = amount
        ctx.fillStyle = paint[band > 9 ? 2 : 0][light ? 4 : 5]
        ctx.fillRect(x - 0.6, fieldHeight * 0.5 - span * 0.43, 1.2, span * 0.86)
      }
    } else if (mode === 1) {
      const size = Math.min(width * 0.105, fieldHeight * 0.157)
      for (let cell = 0; cell < 40; cell++) {
        ctx.fillStyle = paint[(cell % 8 + Math.floor(cell / 8)) % 2 ? 3 : 0][light ? 1 : 2]
        ctx.globalAlpha = amount
        ctx.fillRect(width * 0.5 + (cell % 8 - 4 + 0.09) * size,
          fieldHeight * 0.5 + (Math.floor(cell / 8) - 2.5 + 0.09) * size, size * 0.82, size * 0.82)
      }
    }
    ctx.globalAlpha = 1
  }

  function selectMode(next: HeroMode, userInitiated: boolean) {
    if (userInitiated) manual = true
    if (next === mode) return
    outgoing.set(positions)
    morphStarted = reduced || paused ? time - MORPH_SECONDS : time
    mode = next
    modeAge = 0
    onModeChange(mode)
  }

  function draw() {
    if (!paint.length) return
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = light ? "source-over" : "screen"
    prepareFormation()
    const progress = clamp((time - morphStarted) / MORPH_SECONDS)
    const mix = 1 - (1 - progress) ** 3
    drawLight(mix)
    const dotScale = window.innerWidth < 900 ? 0.85 : 1

    for (let index = 0; index < particles.length; index++) {
      const p = particles[index]
      formation(p, index)
      const offset = index * 2
      const x = mix === 1 ? target.x : outgoing[offset] + (target.x - outgoing[offset]) * mix
      const y = mix === 1 ? target.y : outgoing[offset + 1] + (target.y - outgoing[offset + 1]) * mix
      positions[offset] = x
      positions[offset + 1] = y
      const depth = target.depth
      const alpha = (0.28 + depth * 0.5 + target.energy * 0.22) * (light ? 0.8 : 1)
      const size = (0.8 + depth * 1.15 + target.energy * 0.35) * dotScale
      ctx.fillStyle = paint[target.hue][Math.round(clamp(alpha) * ALPHA_STEPS)]
      ctx.fillRect(x, y, size, size)
      if (depth > 0.82 && index % 31 === 0) {
        ctx.globalAlpha = light ? 0.12 : 0.25
        ctx.drawImage(glows[target.hue], x - 4, y - 4, 9, 9)
        ctx.globalAlpha = 1
      }
    }
    ctx.globalCompositeOperation = "source-over"
  }

  function render(now: number) {
    if (disposed || !visible || document.hidden) return
    const running = !reduced && !paused
    if (running) {
      // Reset last on resume, but never slow visible motion by clamping deltas.
      const delta = Math.max(0, (now - last) / 1000)
      time += delta
      modeAge += delta
      if (!manual && modeAge >= HOLD_SECONDS[mode]) selectMode(((mode + 1) % 3) as HeroMode, false)
    }
    last = now
    draw()
    if (running) frame = requestAnimationFrame(render)
  }

  function syncPlayback() {
    cancelAnimationFrame(frame)
    if (disposed || !visible || document.hidden) return
    last = performance.now()
    // Static redraws also respond to theme changes and mode selection.
    if (reduced || paused) draw()
    else frame = requestAnimationFrame(render)
  }

  function resize() {
    const oldWidth = width
    const oldFieldHeight = fieldHeight
    width = Math.max(1, host!.clientWidth)
    height = Math.max(1, host!.clientHeight)
    fieldHeight = Math.max(1, height - 52)
    const ratio = Math.min(devicePixelRatio || 1, lowPower ? 1 : 1.5)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const mobile = window.innerWidth < 900
    const count = mobile ? (lowPower ? 560 : 900) : (lowPower ? 1100 : 1800)
    if (count !== particles.length) {
      particles = Array.from({ length: count }, (_, index) => createParticle(index, count))
      positions = new Float32Array(count * 2)
      outgoing = new Float32Array(count * 2)
      morphStarted = time - MORPH_SECONDS
    } else {
      for (let index = 0; index < positions.length; index += 2) {
        positions[index] *= width / oldWidth
        positions[index + 1] *= fieldHeight / oldFieldHeight
        outgoing[index] *= width / oldWidth
        outgoing[index + 1] *= fieldHeight / oldFieldHeight
      }
    }
    draw()
    syncPlayback()
  }

  const sizeObserver = new ResizeObserver(resize)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    syncPlayback()
  }, { rootMargin: "10% 0px" })
  const themeObserver = new MutationObserver(readTheme)
  const motionChanged = () => {
    reduced = motion.matches || saveData
    onMotionChange(reduced)
    if (reduced) {
      time = 0
      selectMode(0, false)
      morphStarted = -MORPH_SECONDS
    }
    syncPlayback()
  }

  readTheme()
  resize()
  sizeObserver.observe(host)
  visibilityObserver.observe(host)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  document.addEventListener("visibilitychange", syncPlayback)
  motion.addEventListener("change", motionChanged)
  onMotionChange(reduced)

  return {
    initiallyPaused: paused,
    choose(next: HeroMode) {
      selectMode(next, true)
      syncPlayback()
    },
    pause(value: boolean) {
      paused = value
      if (paused) morphStarted = time - MORPH_SECONDS
      syncPlayback()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      visibilityObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener("visibilitychange", syncPlayback)
      motion.removeEventListener("change", motionChanged)
    },
  }
}
