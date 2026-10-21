import { HowToUseRecipes } from "@/components/how-to-use-recipes"
import { HeroField } from "@/components/hero-field"

export function Hero() {
  return <section className="recipes-hero hero" aria-labelledby="hero-heading">
      <HeroField />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy hero-content">
        <h1 id="hero-heading" className="hero-title">Explore Agora recipes.</h1>
        <div className="hero-description"><p>Voice AI & real-time demos, with code.</p><HowToUseRecipes variant="text" /></div>
      </div>
  </section>
}
