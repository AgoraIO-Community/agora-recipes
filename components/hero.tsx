import { HowToUseRecipes } from "@/components/how-to-use-recipes"
import { HeroField } from "@/components/hero-field"

export function Hero() {
  return <section className="recipes-hero hero" aria-labelledby="hero-heading">
      <HeroField />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy hero-content">
        <h1 id="hero-heading" className="hero-title">Voice AI recipes, ready to ship.</h1>
        <p>Working code, guides, and prompts for building voice AI and real-time experiences with Agora.</p>
        <HowToUseRecipes variant="text" />
      </div>
  </section>
}
