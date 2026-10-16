"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { createHeroRenderer, type HeroMode } from "@/lib/hero-renderer"

const MODES = ["Voice", "Video", "Agent"] as const

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof createHeroRenderer>>(null)
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState<HeroMode>(0)
  const [staticOnly, setStaticOnly] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return
    const renderer = createHeroRenderer(canvasRef.current, setMode, setStaticOnly)
    rendererRef.current = renderer
    if (renderer) setPaused(renderer.initiallyPaused)
    return () => {
      renderer?.dispose()
      rendererRef.current = null
    }
  }, [])

  function togglePause() {
    const next = !paused
    setPaused(next)
    rendererRef.current?.pause(next)
    try { localStorage.setItem("agora-motion", next ? "paused" : "playing") } catch {}
  }

  return (
    <div className="hero-field">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="hero-field-controls">
        <div className="hero-mode-controls" role="group" aria-label="Hero visualization">
          {MODES.map((label, index) => (
            <button key={label} type="button" aria-pressed={mode === index}
              onClick={() => rendererRef.current?.choose(index as HeroMode)}>
              {label}
            </button>
          ))}
        </div>
        {!staticOnly && (
          <button type="button" className="icon-button"
            aria-label={paused ? "Play background animation" : "Pause background animation"}
            aria-pressed={paused} onClick={togglePause}>
            {paused ? <Play size={20} strokeWidth={1.5} /> : <Pause size={20} strokeWidth={1.5} />}
          </button>
        )}
      </div>
    </div>
  )
}
