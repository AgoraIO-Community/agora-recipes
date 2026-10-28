"use client"

import { useI18n } from "@/components/locale-provider"
import { AgoraLogo } from "@/components/agora-logo"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { localePath } from "@/lib/locales"
import { ArrowUp, ArrowUpRight } from "lucide-react"
import { HowToUseRecipes } from "@/components/how-to-use-recipes"
import { Button } from "@/components/ui/button"

const legal = [
  ["Privacy Policy", "https://www.agora.io/en/privacy-policy/"],
  ["Cookie Policy", "https://www.agora.io/en/cookie-policy/"],
  ["Terms of Service", "https://www.agora.io/en/terms-of-service/"],
  ["Acceptable Use Policy", "https://www.agora.io/en/acceptable-use-policy/"],
] as const

export function SiteFooter() {
  const { t, locale } = useI18n()
  const isContributing = localePath(usePathname() ?? "/", "en") === "/contribute"
  return (
    <footer className="site-footer">
      <div className="shell">
        {!isContributing && <div className="footer-invitation">
          <div>
            <h2>{t("Share your project.")}</h2>
            <p>{t("Add your Agora project, demo, or guide to the collection.")}</p>
          </div>
          <Button asChild>
            <a href={localePath("/contribute", locale)}>
              {t("Contribute on GitHub")}<ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>}
        <div className="footer-grid">
          <div className="footer-intro">
            <Link href={localePath("/", locale)} className="site-brand footer-brand" aria-label={t("Agora Recipes home")}>
              <AgoraLogo />
              <span>{t("Recipes")}</span>
            </Link>
            <p>{t("Working Voice AI and RTC projects, built with Agora.")}</p>
          </div>

          <nav className="footer-group" aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading">{t("Explore")}</h2>
            <ul>
              <li><Link className="footer-link" href={`${localePath("/", locale)}#recipes`}>{t("Browse recipes")}</Link></li>
              <li><HowToUseRecipes variant="footer" /></li>
              <li><Link className="footer-link" href="/llms.txt">llms.txt</Link></li>
            </ul>
          </nav>

          <nav className="footer-group" aria-labelledby="footer-developers-heading">
            <h2 id="footer-developers-heading">{t("Build with Agora")}</h2>
            <ul>
              {[
                ["Documentation", "https://docs.agora.io"],
                ["Agora Console", "https://console.agora.io"],
                ["GitHub", "https://github.com/AgoraIO-Community/agora-recipes"],
              ].map(([label, href]) => (
                <li key={t(label)}>
                  <a className="footer-link" href={href} target="_blank" rel="noreferrer"
                    aria-label={t("{label} (opens in a new tab)", { label: t(label) })}>
                    {t(label)} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">Copyright © {new Date().getFullYear()} Agora</p>
          <nav aria-label={t("Legal")} className="footer-legal">
            {legal.map(([label, href]) => <a key={t(label)} href={href}>{t(label)}</a>)}
          </nav>
          <Button asChild variant="ghost" className="footer-top"><a href="#page-top">{t("Back to top")}<ArrowUp aria-hidden="true" /></a></Button>
        </div>
      </div>
    </footer>
  )
}
