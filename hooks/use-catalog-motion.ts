"use client"

import { useLayoutEffect, useRef, type RefObject } from "react"

type Position = { x: number; y: number }

export function useCatalogMotion(ref: RefObject<HTMLDivElement | null>, state: string, query: string) {
  const previous = useRef<{ positions: Map<string, Position>; query: string }>(null)
  const animations = useRef<Animation[]>([])
  useLayoutEffect(() => {
    animations.current.forEach(animation => animation.cancel())
    animations.current = []
    const cards = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-recipe-slug]") ?? [])
    const positions = new Map<string, Position>()
    const measured = cards.map(card => {
      const box = card.getBoundingClientRect()
      const position = { x: box.x + window.scrollX, y: box.y + window.scrollY }
      positions.set(card.dataset.recipeSlug!, position)
      return { card, position }
    })
    const last = previous.current
    if (last && last.query === query && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tokens = getComputedStyle(document.documentElement)
      const time = tokens.getPropertyValue("--ds-duration-standard").trim()
      // Computed CSS may serialize 360ms as .36s.
      const duration = time.endsWith("ms") ? Number.parseFloat(time) : time.endsWith("s") ? Number.parseFloat(time) * 1000 : 360
      const easing = tokens.getPropertyValue("--ease-out").trim() || "cubic-bezier(.16,1,.3,1)"
      for (const { card, position } of measured) {
        const before = last.positions.get(card.dataset.recipeSlug!)
        if (before) {
          const x = before.x - position.x, y = before.y - position.y
          if (Math.abs(x) + Math.abs(y) < 1) continue
          animations.current.push(card.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: "translate(0,0)" }], { duration, easing }))
        } else {
          animations.current.push(card.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing }))
        }
      }
    }
    previous.current = { positions, query }
  }, [ref, state, query])
  useLayoutEffect(() => () => animations.current.forEach(animation => animation.cancel()), [])
}
