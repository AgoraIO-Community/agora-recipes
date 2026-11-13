import { notFound } from "next/navigation"
import { DesignSystemShowcase } from "@/components/design-system/showcase"
import { getRecipeSummaries } from "@/lib/showcase"
import "@/components/design-system/showcase.css"

export const metadata = {
  title: "Recipes design system",
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound()
  const recipes = getRecipeSummaries()
  const cardExamples = ["agora-gemini-mllm-python", "android-autopilot-voice-agent", "agora-podcasts", "agora-voice-shopping-assistant-demo"].flatMap((slug, index) => {
    const recipe = recipes.find(recipe => recipe.slug === slug)
    return recipe ? [index < 2 ? { ...recipe, showcase: undefined } : recipe] : []
  })
  return <DesignSystemShowcase cardExamples={cardExamples} />
}
