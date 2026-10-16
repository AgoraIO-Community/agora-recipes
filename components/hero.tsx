import { ArrowRight } from "lucide-react"
import { HowToUseRecipes } from "@/components/how-to-use-recipes"
import { HeroField } from "@/components/hero-field"

export function Hero() {
  return <section aria-labelledby="hero-heading">
    <div className="shell hero-layout">
      <div className="hero-copy">
        <span className="eyebrow">Voice AI recipes</span>
        <h1 id="hero-heading" className="hero-title">Voice AI recipes,<br />ready to ship.</h1>
        <p>Build voice agents, transcription, and translation workflows on Agora&apos;s low-latency network. Drop a recipe prompt into your coding agent or fork the repo to start from working code.</p>
        <div className="hero-actions">
          <a href="#recipes" className="action action-primary">Browse recipes<ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" /></a>
          <HowToUseRecipes />
        </div>
      </div>
      <HeroField />
    </div>
  </section>
}
