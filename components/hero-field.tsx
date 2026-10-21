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
  const [intent, setIntent] = useState<Intent>("audio")
  const [paused, setPaused] = useState(false)
  const userPaused = useRef(false)
  const carousel = useRef<ReturnType<typeof createHeroCarouselCycle> | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const motion = matchMedia("(prefers-reduced-motion: reduce)")

    // Same-clock captures can select a formation without restoring visible tabs.
    const requested = new URLSearchParams(location.search).get("heroIntent")
    const fixedIntent = readHeroQaClock(location.search) !== null &&
      INTENTS.includes(requested as Intent) ? requested as Intent : null
    const cycle = createHeroCarouselCycle({
      onShow: (index) => setIntent(INTENTS[index]),
    })
    carousel.current = cycle

    const syncMotion = () => {
      cycle.setPaused("user", motion.matches || userPaused.current)
    }
    const syncHidden = () => cycle.setPaused("hidden", document.hidden)
    const observer = new IntersectionObserver(([entry]) =>
      cycle.setPaused("offscreen", !entry.isIntersecting),
    )
    syncMotion()
    syncHidden()
    let fixedFrame = 0
    if (fixedIntent) {
      cycle.stop()
      fixedFrame = requestAnimationFrame(() => setIntent(fixedIntent))
    } else cycle.start(0)
    observer.observe(host)
    motion.addEventListener("change", syncMotion)
    document.addEventListener("visibilitychange", syncHidden)
    return () => {
      cycle.stop()
      carousel.current = null
      cancelAnimationFrame(fixedFrame)
      observer.disconnect()
      motion.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncHidden)
    }
  }, [])

  return (
    <div ref={hostRef} className="hero-field">
      <RealtimeField phase="idle" intent={intent} amplitudeRef={amplitudeRef}
        exitProgressRef={exitProgressRef} paused={paused} />
      <button type="button" className="hero-pause icon-button" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => {
        const next = !paused
        userPaused.current = next
        setPaused(next)
        carousel.current?.setPaused("user", next || matchMedia("(prefers-reduced-motion: reduce)").matches)
      }}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
    </div>
  )
}
