import { notFound } from "next/navigation"
import { DesignSystemShowcase } from "@/components/design-system/showcase"
import "@/components/design-system/showcase.css"

export const metadata = {
  title: "Recipes design system",
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound()
  return <DesignSystemShowcase />
}
