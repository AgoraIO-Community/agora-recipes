"use client"

import { useI18n } from "@/components/locale-provider"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setTheme, useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { t } = useI18n()
  const theme = useTheme()
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button variant="ghost" size="icon" type="button" className="theme-toggle" aria-label={t(label)} title={t(label)} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <span className="theme-toggle__icons" aria-hidden="true"><Sun /><Moon /></span>
    </Button>
  )
}
