"use client"

import { useSyncExternalStore } from "react"
import { applyTheme, THEME_CHANGE_EVENT, THEME_STORAGE_KEY, type Theme } from "@/lib/theme"

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

function getServerTheme(): Theme {
  return "dark"
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
    applyTheme(event.newValue === "light" ? "light" : "dark")
    onChange()
  }
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onStorage)
  }
}

export function setTheme(theme: Theme) {
  applyTheme(theme)
  try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch { /* The current page still works when storage is unavailable. */ }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, getServerTheme)
}
