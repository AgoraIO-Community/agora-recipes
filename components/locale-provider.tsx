"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { translate, type Locale, type Messages } from "@/lib/locales"

const LocaleContext = createContext<{ locale: Locale; messages: Messages }>({ locale: "en", messages: {} })

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useI18n() {
  const { locale, messages } = useContext(LocaleContext)
  return { locale, t: (key: string, values?: Record<string, string | number>) => translate(messages, key, values) }
}
