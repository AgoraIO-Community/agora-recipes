"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowUpRight, Github } from "lucide-react"
import { AgoraLogo } from "@/components/agora-logo"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LanguageSwitcher } from "@/components/language-switcher"
import { localePath } from "@/lib/locales"
import { ThemeToggle } from "@/components/theme-toggle"

const repositoryUrl = "https://github.com/AgoraIO-Community/agora-recipes"
const signupUrl = "https://sso2.agora.io/en/signup"
const links = [["Docs", "https://docs.agora.io"], ["GitHub", repositoryUrl]] as const

export function SiteHeader() {
  const { t, locale } = useI18n()
  const contributeUrl = localePath("/contribute", locale)
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
    <header className="site-header" data-scrolled={scrolled || open} data-detail={localePath(pathname, "en").startsWith("/recipes/")}>
      <div className="site-header__content shell">
        <Link href={localePath("/", locale)} className="site-brand" aria-label={t("Agora Recipes home")}>
          <AgoraLogo /><span>{t("Recipes")}</span>
        </Link>

        <nav className="desktop-nav" aria-label={t("Main navigation")}>
          <Button asChild variant={pathname === localePath("/", locale) ? "secondary" : "ghost"}>
            <Link href={`${localePath("/", locale)}#recipes`} aria-current={pathname === localePath("/", locale) ? "page" : undefined}>{t("Recipes")}</Link>
          </Button>
          <Button asChild variant={pathname.includes("/topics") ? "secondary" : "ghost"}><Link href={localePath("/topics", locale)} aria-current={pathname.includes("/topics") ? "page" : undefined}>{t("Topics")}</Link></Button>
          {links.map(([label, href]) => (
            <Button asChild variant="ghost" key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t(label) })}>
                {t(label)}<ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ))}
        </nav>

        <div className="header-actions">
          <Button asChild variant="ghost" className="header-contribute">
            <a href={contributeUrl} aria-label={t("Contribute")}>{t("Contribute")}</a>
          </Button>
          <div className="header-language"><LanguageSwitcher /></div>
          <ThemeToggle />
          <Button asChild className="header-cta">
            <a href={signupUrl} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Get started") })}>{t("Get started")}<ArrowUpRight aria-hidden="true" /></a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="header-github">
            <a href={repositoryUrl} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("GitHub") })}><Github aria-hidden="true" /></a>
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button" className="menu-toggle" aria-label={t(open ? "Close navigation" : "Open navigation")}>
                <span className="menu-toggle__icons" data-open={open}>
                  <Menu aria-hidden="true" /><X aria-hidden="true" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={24} collisionPadding={16} className="site-navigation-panel" aria-label={t("Site navigation")}>
              <nav className="mobile-navigation" aria-label={t("Mobile navigation")}>
                <Button asChild variant={pathname === localePath("/", locale) ? "secondary" : "ghost"}>
                  <Link href={`${localePath("/", locale)}#recipes`} aria-current={pathname === localePath("/", locale) ? "page" : undefined} onClick={() => setOpen(false)}>{t("Recipes")}</Link>
                </Button>
                <Button asChild variant={pathname.includes("/topics") ? "secondary" : "ghost"}><Link href={localePath("/topics", locale)} onClick={() => setOpen(false)}>{t("Topics")}</Link></Button>
                {links.map(([label, href]) => (
                  <Button asChild variant="ghost" key={label}>
                    <a href={href} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t(label) })} onClick={() => setOpen(false)}>
                      {t(label)}<ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                ))}

                <div className="mobile-navigation__actions">
                  <Button asChild variant="ghost">
                    <a href={contributeUrl} aria-label={t("Contribute")} onClick={() => setOpen(false)}>{t("Contribute")}<ArrowUpRight aria-hidden="true" /></a>
                  </Button>
                  <Button asChild>
                    <a href={signupUrl} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Get started") })} onClick={() => setOpen(false)}>{t("Get started")}<ArrowUpRight aria-hidden="true" /></a>
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
