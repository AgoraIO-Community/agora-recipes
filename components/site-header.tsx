import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AgoraLogo } from "@/components/agora-logo"
import { Github } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight"
          aria-label="Agora Voice AI Recipes home"
        >
          <AgoraLogo className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-flex items-baseline gap-1.5">
            <span className="text-foreground">Agora</span>
            <span className="text-muted-foreground/80 text-sm">/ Voice AI Recipes</span>
          </span>
          <span className="sm:hidden text-foreground">Voice AI</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="ml-auto flex items-center gap-1 sm:gap-2"
        >
          <Link
            href="/#recipes"
            className="hidden sm:inline-flex h-8 items-center px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="https://docs.agora.io"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex h-8 items-center px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
            <Link
              href="https://github.com/AgoraIO-Community/voice-ai-recipes"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8">
            <Link
              href="https://console.agora.io/signup"
              target="_blank"
              rel="noreferrer"
            >
              Get started
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
