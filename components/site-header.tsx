"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowUpRight, Github } from "lucide-react"
import { AgoraLogo } from "@/components/agora-logo"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"

const repositoryUrl = "https://github.com/AgoraIO-Community/agora-recipes"
const contributeUrl = `${repositoryUrl}/blob/main/CONTRIBUTING.md`
const signupUrl = "https://sso2.agora.io/en/signup"
const links = [["Docs", "https://docs.agora.io"], ["GitHub", repositoryUrl]] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState({ pathname, open: false })
  const open = menu.pathname === pathname && menu.open
  const setOpen = (next: boolean) => setMenu({ pathname, open: next })

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 8)
    scroll()
    window.addEventListener("scroll", scroll, { passive: true })
    return () => window.removeEventListener("scroll", scroll)
  }, [pathname])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)")
    const close = () => {
      if (desktop.matches) setMenu({ pathname, open: false })
    }
    desktop.addEventListener("change", close)
    return () => desktop.removeEventListener("change", close)
  }, [pathname])

  return (
    <header className="site-header" data-scrolled={scrolled || open} data-detail={pathname.startsWith("/recipes/")}>
      <div className="site-header__content shell">
        <Link href="/" className="site-brand" aria-label="Agora Recipes home">
          <AgoraLogo /><span>Recipes</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Button asChild variant="secondary">
            <Link href="/#recipes" aria-current={pathname === "/" ? "page" : undefined}>Recipes</Link>
          </Button>
          {links.map(([label, href]) => (
            <Button asChild variant="ghost" key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`}>
                {label}<ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ))}
        </nav>

        <div className="header-actions">
          <Button asChild variant="ghost" className="header-contribute">
            <a href={contributeUrl} target="_blank" rel="noreferrer" aria-label="Contribute (opens in a new tab)">Contribute</a>
          </Button>
          <ThemeToggle />
          <Button asChild className="header-cta">
            <a href={signupUrl} target="_blank" rel="noreferrer" aria-label="Get started (opens in a new tab)">Get started<ArrowUpRight aria-hidden="true" /></a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="header-github">
            <a href={repositoryUrl} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)"><Github aria-hidden="true" /></a>
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"}>
                <span className="menu-toggle__icons" data-open={open}>
                  <Menu aria-hidden="true" /><X aria-hidden="true" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={24} collisionPadding={16} className="site-navigation-panel" aria-label="Site navigation">
              <nav className="mobile-navigation" aria-label="Mobile navigation">
                <Button asChild variant="secondary">
                  <Link href="/#recipes" aria-current={pathname === "/" ? "page" : undefined} onClick={() => setOpen(false)}>Recipes</Link>
                </Button>
                {links.map(([label, href]) => (
                  <Button asChild variant="ghost" key={label}>
                    <a href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`} onClick={() => setOpen(false)}>
                      {label}<ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                ))}
                <div className="mobile-navigation__actions">
                  <Button asChild variant="ghost">
                    <a href={contributeUrl} target="_blank" rel="noreferrer" aria-label="Contribute (opens in a new tab)" onClick={() => setOpen(false)}>Contribute<ArrowUpRight aria-hidden="true" /></a>
                  </Button>
                  <Button asChild>
                    <a href={signupUrl} target="_blank" rel="noreferrer" aria-label="Get started (opens in a new tab)" onClick={() => setOpen(false)}>Get started<ArrowUpRight aria-hidden="true" /></a>
                  </Button>
                </div>
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
