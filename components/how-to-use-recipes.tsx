"use client"

import { useI18n } from "@/components/locale-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Search, Wand2, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    title: "Find your starting point",
    description:
      "Browse projects and recipes, then filter by platform, use case, or available material.",
    icon: Search,
  },
  {
    title: "Try it or bring it to your coding agent",
    description:
      "Open an available demo or video. If a recipe is provided, copy its prompt or follow the original guide.",
    icon: Wand2,
  },
  {
    title: "Configure, run, and make it yours",
    description:
      "Follow the author’s setup instructions and test the example before adapting it to your workflow.",
    icon: Terminal,
  },
]

export function HowToUseRecipes({ variant = "button" }: { variant?: "button" | "footer" | "text" }) {
  const { t } = useI18n()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant === "footer" ? "link" : variant === "text" ? "ghost" : "outline"}
        >
          {t(variant === "footer" ? "How to use recipes" : "How to use these recipes")}
          {variant !== "footer" && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-brand text-2xl font-normal leading-tight sm:text-3xl">
            {t("How to use these recipes")}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {t("Explore demos, source, and guides. Each entry shows only the materials its author provides.")}
          </DialogDescription>
        </DialogHeader>

        <ol className="ag-reading-plane grid gap-4 md:grid-cols-3">
          {steps.map(({ title, description, icon: Icon }) => (
            <li key={title} className="p-5 sm:p-6">
              <div className="flex items-center justify-between" aria-hidden="true">
                <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 detail-title">
                {t(title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(description)}
              </p>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
