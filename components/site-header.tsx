"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { AgoraLogo } from "@/components/agora-logo"

const links = [
  ["Docs", "https://docs.agora.io"],
  ["GitHub", "https://github.com/AgoraIO-Community/agora-recipes"],
  ["Submit a recipe", "https://github.com/AgoraIO-Community/agora-recipes/blob/main/CONTRIBUTING.md"],
] as const

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const [menu, setMenu] = useState({ pathname, open: false })
  const open = menu.pathname === pathname && menu.open
  const setOpen = (next: boolean) => setMenu({ pathname, open: next })
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 8)
    scroll()
    window.addEventListener("scroll", scroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", scroll)
    }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu({ pathname, open: false }); menuButton.current?.focus() }
    }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [open, pathname])
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
