"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useI18n } from "./locale-provider"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

/** The same input moves into the header; its draft, focus, and IME session survive. */
export function CatalogSearch({ value, composing, inputRef, onChange, onComposition, onSubmit, onFocus, onFilter, filterCount }: {
  value: string; composing: boolean; inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string, immediate?: boolean) => void; onComposition: (value: boolean) => void;
  onSubmit: () => void; onFocus: () => void; onFilter: (button: HTMLButtonElement) => void; filterCount: number;
}) {
  const { t } = useI18n()
  const anchor = useRef<HTMLDivElement>(null)
  const [docked, setDocked] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const header = document.querySelector<HTMLElement>(".site-header")
    const slot = header?.querySelector<HTMLElement>(".header-search-slot")
    const holder = anchor.current
    if (!header || !slot || !holder) return
    const measure = () => {
      const next = holder.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom
      root.dataset.catalogSearch = next ? "docked" : "inline"
      if (next) {
        const rect = slot.getBoundingClientRect()
        holder.style.setProperty("--search-top", `${rect.top}px`)
        holder.style.setProperty("--search-left", `${rect.left}px`)
        holder.style.setProperty("--search-width", `${rect.width}px`)
      }
      setDocked(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    observer.observe(slot)
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      delete root.dataset.catalogSearch
    }
  }, [])
  return <div ref={anchor} className="catalog-search-anchor">
    <form role="search" className="catalog-search" data-docked={docked || undefined} onSubmit={event => { event.preventDefault(); if (!composing) onSubmit() }}>
      <label htmlFor="recipe-search" className="sr-only">{t("Search projects, guides, or authors")}</label>
      <InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
        <InputGroupInput ref={inputRef} id="recipe-search" type="search" placeholder={t("Search projects, guides, or authors…")} aria-keyshortcuts="Meta+K Control+K" autoComplete="off" value={value} onFocus={onFocus}
          onCompositionStart={() => onComposition(true)} onCompositionEnd={event => { onComposition(false); onChange(event.currentTarget.value) }}
          onKeyDown={event => { if (!event.nativeEvent.isComposing && event.key === "Escape") { if (value) { event.preventDefault(); onChange("", true) } else event.currentTarget.blur() } }}
          onChange={event => onChange(event.target.value)} />
        <InputGroupAddon align="inline-end">
          {value ? <InputGroupButton size="icon-sm" aria-label={t("Clear search")} onClick={() => onChange("", true)}><X aria-hidden="true" /></InputGroupButton> : !docked && <kbd className="catalog-search__shortcut" aria-hidden="true">⌘ K</kbd>}
          {docked && <InputGroupButton size="icon-sm" aria-label={filterCount ? t("Filters, {count} active", { count: filterCount }) : t("Filters")} onClick={event => onFilter(event.currentTarget)}><SlidersHorizontal aria-hidden="true" /></InputGroupButton>}
        </InputGroupAddon>
      </InputGroup>
    </form>
  </div>
}
