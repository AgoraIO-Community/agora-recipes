"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Search, Wand2, Terminal } from "lucide-react"

const steps = [
  {
    title: "Find your starting point",
    description:
      "Browse Voice AI or RTC recipes, then filter by platform, use case, or capability. Open a recipe to review what it builds and its difficulty level.",
    icon: Search,
  },
  {
    title: "Bring it to your coding agent",
    description:
      "Copy the Recipe prompt and paste it into your coding agent to help set up the project. Prefer to build hands-on? Open Source on GitHub and clone or fork the implementation repo.",
    icon: Wand2,
  },
  {
    title: "Configure, run, and make it yours",
    description:
      "Follow the recipe’s instructions to install dependencies, configure your Agora and provider credentials, and run the app. Test the example, then adapt it to your workflow.",
    icon: Terminal,
  },
]

export function HowToUseRecipes({ variant = "button" }: { variant?: "button" | "footer" | "text" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={variant === "footer" ? "footer-link" : variant === "text" ? "text-action hero-help" : "action action-secondary"}
        >
          {variant === "footer" ? "How to use recipes" : "How to use these recipes"}
          {variant !== "footer" && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-brand text-2xl font-normal leading-tight sm:text-3xl">
            How to use these recipes
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Each recipe pairs working code with a guide and a prompt for your
            coding agent. Go from an idea to a running example in three steps.
          </DialogDescription>
        </DialogHeader>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map(({ title, description, icon: Icon }) => (
            <li key={title} className="p-5 sm:p-6">
              <div className="flex items-center justify-between" aria-hidden="true">
                <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 detail-title">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
