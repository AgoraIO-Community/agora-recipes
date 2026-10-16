"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react"
import { AgoraLogo } from "@/components/agora-logo"

const links = [
  ["Docs", "https://docs.agora.io"],
  ["GitHub", "https://github.com/AgoraIO-Community/agora-recipes"],
  ["Submit a recipe", "https://github.com/AgoraIO-Community/agora-recipes/blob/main/CONTRIBUTING.md"],
] as const

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pathname = usePathname()
  useEffect(() => {
    setMounted(true)
    const scroll = () => setScrolled(window.scrollY > 8)
    scroll()
    window.addEventListener("scroll", scroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", scroll)
      clearTimeout(transitionTimer.current)
      document.documentElement.classList.remove("theme-switching")
    }
  }, [])
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus() }
    }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [open])
  const dark = resolvedTheme === "dark"
  function toggleTheme() {
    const root = document.documentElement
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-switching")
      clearTimeout(transitionTimer.current)
      transitionTimer.current = setTimeout(() => root.classList.remove("theme-switching"), 240)
    }
    setTheme(dark ? "light" : "dark")
  }
  return (
    <header className="site-header" data-scrolled={scrolled || open}>
      <div className="site-header__content shell">
        <Link href="/" className="site-brand" aria-label="Agora Recipes home">
          <AgoraLogo /><span>/ Recipes</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-button theme-toggle" onClick={toggleTheme} disabled={!mounted} aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"}>
            {mounted && (dark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />)}
          </button>
          <a className="header-cta" href="https://sso2.agora.io/en/signup" target="_blank" rel="noreferrer" aria-label="Get started (opens in a new tab)">Get started <ArrowUpRight size={16} aria-hidden="true" /></a>
          <button ref={menuButton} type="button" className="icon-button menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
        {links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
        <a href="https://sso2.agora.io/en/signup" target="_blank" rel="noreferrer" aria-label="Get started (opens in a new tab)">Get started<ArrowUpRight size={16} aria-hidden="true" /></a>
      </nav>
    </header>
  )
}
