"use client"

import { useEffect, useRef, useState } from "react"
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

    const syncMotion = () => {
      cycle.setPaused("user", motion.matches)
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
      observer.disconnect()
      motion.removeEventListener("change", syncMotion)
      document.removeEventListener("visibilitychange", syncHidden)
    }
  }, [])

  return (
    <div ref={hostRef} className="hero-field">
      <RealtimeField phase="idle" intent={intent} amplitudeRef={amplitudeRef}
        exitProgressRef={exitProgressRef} />
    </div>
  )
}
