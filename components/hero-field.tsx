"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { RealtimeField } from "@/lib/website-hero/shader-realtime-field"
import { createHeroCarouselCycle } from "@/lib/website-hero/hero-carousel"
import { readHeroQaClock } from "@/lib/website-hero/hero-renderer-policy"

const INTENTS = ["audio", "video", "conversation"] as const
type Intent = typeof INTENTS[number]

/** Recipes supplies autoplay only; the visual renderer is the website component. */
export function HeroField() {
  const hostRef = useRef<HTMLDivElement>(null)
  const amplitudeRef = useRef(0)
  const exitProgressRef = useRef(0)
  const cycleRef = useRef<ReturnType<typeof createHeroCarouselCycle> | null>(null)
  const pausedRef = useRef(false)
  const reducedRef = useRef(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [intent, setIntent] = useState<Intent>("audio")

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    try { pausedRef.current = localStorage.getItem("agora-motion") === "paused" } catch {}
    setPaused(pausedRef.current)

    // Same-clock captures can select a formation without restoring visible tabs.
    const requested = new URLSearchParams(location.search).get("heroIntent")
    const fixedIntent = readHeroQaClock(location.search) !== null &&
      INTENTS.includes(requested as Intent) ? requested as Intent : null
    const cycle = createHeroCarouselCycle({
      onShow: (index) => setIntent(INTENTS[index]),
    })
    cycleRef.current = cycle

    const syncMotion = () => {
      reducedRef.current = motion.matches
      setReduced(motion.matches)
      cycle.setPaused("user", pausedRef.current || motion.matches)
    }
    const syncHidden = () => cycle.setPaused("hidden", document.hidden)
    const observer = new IntersectionObserver(([entry]) =>
      cycle.setPaused("offscreen", !entry.isIntersecting),
    )
    syncMotion()
    syncHidden()
    if (fixedIntent) {
      cycle.stop()
      setIntent(fixedIntent)
    } else cycle.start(0)
    observer.observe(host)
    motion.addEventListener("change", syncMotion)
    document.addEventListener("visibilitychange", syncHidden)
    return () => {
      cycle.stop()
      cycleRef.current = null
      observer.disconnect()
      motion.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncHidden)
    }
  }, [])

  function togglePause() {
    const next = !pausedRef.current
    pausedRef.current = next
    setPaused(next)
    cycleRef.current?.setPaused("user", next || reducedRef.current)
    try { localStorage.setItem("agora-motion", next ? "paused" : "playing") } catch {}
  }

  return (
    <div ref={hostRef} className="hero-field">
      <RealtimeField phase="idle" intent={intent} amplitudeRef={amplitudeRef}
        exitProgressRef={exitProgressRef} paused={paused} />
      {!reduced && (
        <button type="button" className="icon-button hero-pause"
          aria-label={paused ? "Play background animation" : "Pause background animation"}
          aria-pressed={paused} onClick={togglePause}>
          {paused ? <Play size={20} strokeWidth={1.5} /> : <Pause size={20} strokeWidth={1.5} />}
        </button>
      )}
    </div>
  )
}
