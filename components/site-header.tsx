"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { AgoraLogo } from "@/components/agora-logo"
import { Github } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const [recipeNavActive, setRecipeNavActive] = React.useState(false)

  React.useEffect(() => {
    setRecipeNavActive(false)
    document.documentElement.removeAttribute("data-recipe-nav-active")
    document.documentElement.removeAttribute("data-recipe-nav-ready")
    if (pathname !== "/" || !("IntersectionObserver" in window)) return

    const sentinel = document.querySelector(".recipe-toolbar__sentinel")
    if (!sentinel) return
    document.documentElement.setAttribute("data-recipe-nav-ready", "")
    let activeState = false

    const updateNavigation = (active: boolean) => {
      if (active === activeState) return
      activeState = active

      const commit = () => {
        document.documentElement.toggleAttribute(
          "data-recipe-nav-active",
          active,
        )
        flushSync(() => setRecipeNavActive(active))
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      if (!reduceMotion && "startViewTransition" in document) {
        document.startViewTransition(commit)
      } else {
        commit()
      }
    }

    const handleScroll = () => {
      // Once the recipe controls merge into the header, keep them latched there.
      // Search and filter updates can change the document geometry, but they
      // cannot release the latch. Only returning to the top of the page can.
      if (activeState && window.scrollY <= 1) updateNavigation(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = !entry.isIntersecting && entry.boundingClientRect.top < 0
        if (active) updateNavigation(true)
      },
      { rootMargin: "-1px 0px 0px" },
    )

    observer.observe(sentinel)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.removeAttribute("data-recipe-nav-active")
      document.documentElement.removeAttribute("data-recipe-nav-ready")
    }
  }, [pathname])

  return (
    <header
      className="site-header sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      data-recipe-active={recipeNavActive || undefined}
      aria-hidden={recipeNavActive || undefined}
      inert={recipeNavActive ? true : undefined}
    >
      <div className="site-header__content mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-medium tracking-tight"
          aria-label="Agora Recipes home"
        >
          <AgoraLogo className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-flex items-baseline gap-1.5">
            <span className="text-foreground">Agora</span>
            <span className="text-muted-foreground/80 text-sm">/ Recipes</span>
          </span>
          <span className="sm:hidden text-foreground">Recipes</span>
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
