"use client"

import { useI18n } from "@/components/locale-provider"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Wand2, Terminal } from "lucide-react"
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
          size={variant === "footer" ? "resource" : "default"}
          variant={variant === "footer" ? "link" : variant === "text" ? "ghost" : "outline"}
        >
          {t(variant === "footer" ? "How to use recipes" : "How to use these recipes")}
        </Button>
      </DialogTrigger>
      <DialogContent className="recipe-help-dialog" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {t("How to use these recipes")}
          </DialogTitle>
        </DialogHeader>

        <DialogBody><ol className="grid gap-5 md:grid-cols-3">
          {steps.map(({ title, description, icon: Icon }) => (
            <li key={title}>
              <div className="flex items-center justify-between" aria-hidden="true">
                <Icon size={16} className="text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="mt-3 text-sm font-normal leading-5">
                {t(title)}
              </h3>
              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                {t(description)}
              </p>
            </li>
          ))}
        </ol></DialogBody>
      </DialogContent>
    </Dialog>
  )
}
