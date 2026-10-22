"use client"

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react"

type Theme = "light" | "dark"
const ThemeContext = createContext<Theme | undefined>(undefined)

function subscribe(callback: () => void) {
  const preference = matchMedia("(prefers-color-scheme: dark)")
  preference.addEventListener("change", callback)
  return () => preference.removeEventListener("change", callback)
}

function getTheme(): Theme {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Appearance follows the device only. Do not expose a theme selector or setter. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => undefined)

  useEffect(() => {
    if (!theme) return
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useSystemTheme() {
  return useContext(ThemeContext)
}
