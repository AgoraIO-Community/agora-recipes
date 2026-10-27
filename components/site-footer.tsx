import { AgoraLogo } from "@/components/agora-logo"
import Link from "next/link"
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
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-invitation">
          <div>
            <h2>Share your recipe.</h2>
            <p>Add your Agora project and guide to the collection.</p>
          </div>
          <Button asChild>
            <a href="https://github.com/AgoraIO-Community/agora-recipes/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" aria-label="Contribute on GitHub (opens in a new tab)">
              Contribute on GitHub<ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="footer-grid">
          <div className="footer-intro">
            <Link href="/" className="site-brand footer-brand" aria-label="Agora Recipes home">
              <AgoraLogo />
              <span>Recipes</span>
            </Link>
            <p>Working Voice AI and RTC projects, built with Agora.</p>
          </div>

          <nav className="footer-group" aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading">Explore</h2>
            <ul>
              <li><Link className="footer-link" href="/#recipes">Browse recipes</Link></li>
              <li><HowToUseRecipes variant="footer" /></li>
              <li><Link className="footer-link" href="/llms.txt">llms.txt</Link></li>
            </ul>
          </nav>

          <nav className="footer-group" aria-labelledby="footer-developers-heading">
            <h2 id="footer-developers-heading">Build with Agora</h2>
            <ul>
              {[
                ["Documentation", "https://docs.agora.io"],
                ["Agora Console", "https://console.agora.io"],
                ["GitHub", "https://github.com/AgoraIO-Community/agora-recipes"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a className="footer-link" href={href} target="_blank" rel="noreferrer"
                    aria-label={`${label} (opens in a new tab)`}>
                    {label} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">Copyright © {new Date().getFullYear()} Agora</p>
          <nav aria-label="Legal" className="footer-legal">
            {legal.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <Button asChild variant="ghost" className="footer-top"><a href="#page-top">Back to top<ArrowUp aria-hidden="true" /></a></Button>
        </div>
      </div>
    </footer>
  )
}
