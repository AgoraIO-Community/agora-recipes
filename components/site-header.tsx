"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { AgoraLogo } from "@/components/agora-logo"
import { Github } from "lucide-react"

type RecipeNavStage = "expanded" | "folded" | "merged"
const FOLD_SETTLE_DELAY_MS = 80

export function SiteHeader() {
  const pathname = usePathname()
  const [recipeNavStage, setRecipeNavStage] =
    React.useState<RecipeNavStage>("expanded")

  React.useEffect(() => {
    setRecipeNavStage("expanded")
    document.documentElement.removeAttribute("data-recipe-nav-active")
    document.documentElement.removeAttribute("data-recipe-nav-folded")
    document.documentElement.removeAttribute("data-recipe-nav-ready")
    if (pathname !== "/") return

    const sentinel = document.querySelector(".recipe-toolbar__sentinel")
    const heroTitle = document.querySelector(".page-hero__title")
    const siteHeader = document.querySelector(".site-header")
    if (!sentinel || !heroTitle) return
    document.documentElement.setAttribute("data-recipe-nav-ready", "")
    let currentStage: RecipeNavStage = "expanded"
    let pendingStage: RecipeNavStage | undefined
    let transitionRunning = false
    let skipActiveTransition: (() => void) | undefined
    let animationFrame = 0
    let foldTimer = 0
    let disposed = false
    let lastScrollY = window.scrollY
    let lastEvaluationTime = performance.now()

    const updateNavigation = (
      nextStage: RecipeNavStage,
      skipCurrentTransition = false,
    ) => {
      if (transitionRunning) {
        pendingStage = nextStage
        if (skipCurrentTransition && nextStage !== currentStage) {
          skipActiveTransition?.()
        }
        return
      }
      if (nextStage === currentStage) return

      const commit = () => {
        currentStage = nextStage
        document.documentElement.toggleAttribute(
          "data-recipe-nav-active",
          nextStage === "merged",
        )
        document.documentElement.toggleAttribute(
          "data-recipe-nav-folded",
          nextStage === "folded",
        )
        flushSync(() => setRecipeNavStage(nextStage))
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      if (!reduceMotion && "startViewTransition" in document) {
        transitionRunning = true
        const transition = document.startViewTransition(commit)
        const skipTransition = () => transition.skipTransition()
        skipActiveTransition = skipTransition
        transition.finished.finally(() => {
          if (disposed) return
          if (skipActiveTransition === skipTransition) {
            skipActiveTransition = undefined
          }
          transitionRunning = false
          const queuedStage = pendingStage
          pendingStage = undefined
          if (queuedStage) updateNavigation(queuedStage)
        })
      } else {
        commit()
      }
    }

    const requestNavigation = (
      nextStage: RecipeNavStage,
      isFastScroll: boolean,
    ) => {
      if (nextStage !== "folded" && foldTimer) {
        window.clearTimeout(foldTimer)
        foldTimer = 0
      }

      if (nextStage === "folded" && currentStage !== "folded") {
        if (foldTimer) return
        foldTimer = window.setTimeout(() => {
          foldTimer = 0
          updateNavigation("folded")
        }, FOLD_SETTLE_DELAY_MS)
        return
      }

      updateNavigation(nextStage, isFastScroll)
    }

    const evaluateNavigation = () => {
      animationFrame = 0
      const now = performance.now()
      const scrollY = window.scrollY
      const scrollDistance = Math.abs(scrollY - lastScrollY)
      const elapsed = Math.max(now - lastEvaluationTime, 1)
      const isFastScroll = scrollDistance >= 96 || scrollDistance / elapsed >= 1.5
      lastScrollY = scrollY
      lastEvaluationTime = now

      const sentinelTop = sentinel.getBoundingClientRect().top
      const heroTitleBottom = heroTitle.getBoundingClientRect().bottom
      const foldBoundary = siteHeader?.getBoundingClientRect().bottom ?? 56
      const nextStage: RecipeNavStage =
        sentinelTop <= 0
          ? "merged"
          : heroTitleBottom <= foldBoundary
            ? "folded"
            : "expanded"
      requestNavigation(nextStage, isFastScroll)
    }

    const handleScroll = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(evaluateNavigation)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    evaluateNavigation()

    return () => {
      disposed = true
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      if (foldTimer) window.clearTimeout(foldTimer)
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.removeAttribute("data-recipe-nav-active")
      document.documentElement.removeAttribute("data-recipe-nav-folded")
      document.documentElement.removeAttribute("data-recipe-nav-ready")
    }
  }, [pathname])

  const recipeNavActive = recipeNavStage === "merged"

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
            href="https://docs.agora.io"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex h-8 items-center px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
            <Link
              href="https://github.com/AgoraIO-Community/agora-recipes"
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
