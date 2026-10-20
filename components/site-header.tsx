import Link from "next/link"
import { Github, ArrowUpRight } from "lucide-react"
import { AgoraLogo } from "@/components/agora-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="showcase-header border-b border-border bg-background">
      <div className="showcase-container flex min-h-14 items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Agora Recipes home">
          <AgoraLogo className="size-7" />
          <span className="font-brand text-base font-semibold tracking-tight">Agora <span className="font-normal text-muted-foreground">/ Recipes</span></span>
        </Link>
        <nav aria-label="Main navigation" className="showcase-navigation flex items-center gap-2 sm:gap-5 lg:gap-7 text-sm font-medium">
          <Link href="/#recipes" className="hidden sm:inline-flex">Explore recipes</Link>
          <a href="https://github.com/AgoraIO-Community/agora-recipes/blob/staging/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-1">Contribute <ArrowUpRight className="size-3.5" aria-hidden="true" /></a>
          <a href="https://github.com/AgoraIO-Community/agora-recipes" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2" aria-label="Agora Recipes on GitHub (opens in a new tab)"><Github className="size-5" aria-hidden="true" /><span className="hidden sm:inline">GitHub</span></a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
