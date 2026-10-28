"use client"

import { useI18n } from "@/components/locale-provider"
import { Moon, Sun } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { setTheme, useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { t } = useI18n()
  const theme = useTheme()
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme"

  return (
    <IconButton className="theme-toggle" label={t(label)} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <span className="theme-toggle__icons" aria-hidden="true"><Sun /><Moon /></span>
    </IconButton>
  )
}
