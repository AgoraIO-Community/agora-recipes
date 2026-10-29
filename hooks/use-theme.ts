"use client"

import { useSyncExternalStore } from "react"
import { THEME_QUERY, type Theme } from "@/lib/theme"

const getTheme = (): Theme => window.matchMedia(THEME_QUERY).matches ? "dark" : "light"
const getServerTheme = (): Theme => "dark"
function subscribe(onChange: () => void) {
  const preference = window.matchMedia(THEME_QUERY)
  preference.addEventListener("change", onChange)
  return () => preference.removeEventListener("change", onChange)
}
export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, getServerTheme)
}
