import { AgoraLogo } from "@/components/agora-logo"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HowToUseRecipes } from "@/components/how-to-use-recipes"

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
        <div className="footer-grid">
          <div className="footer-intro">
            <Link href="/" className="footer-brand" aria-label="Agora Recipes home">
              <AgoraLogo />
              <span>/ Recipes</span>
            </Link>
            <p>Recipes and guides for building voice AI and real-time experiences with Agora.</p>
          </div>

          <nav className="footer-group" aria-labelledby="footer-explore-heading">
            <h2 id="footer-explore-heading">Explore</h2>
            <ul>
              <li><Link className="footer-link" href="/#recipes">Browse recipes</Link></li>
              <li><HowToUseRecipes variant="footer" /></li>
              <li>
                <a className="footer-link" href="https://github.com/AgoraIO-Community/agora-recipes/blob/main/CONTRIBUTING.md"
                  target="_blank" rel="noreferrer" aria-label="Submit a recipe (opens in a new tab)">
                  Submit a recipe <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </nav>

          <nav className="footer-group" aria-labelledby="footer-developers-heading">
            <h2 id="footer-developers-heading">Developers</h2>
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
          <nav aria-label="Legal" className="footer-legal">
            {legal.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <div className="footer-meta">
            <p>Copyright © {new Date().getFullYear()} Agora <span className="footer-rights">All rights reserved.</span></p>
            <a href="https://hyperos.mi.com/font/en/" target="_blank" rel="noreferrer"
              aria-label="Typography by MiSans (opens in a new tab)">Typography by MiSans</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
