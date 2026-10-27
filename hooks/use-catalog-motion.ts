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
      for (const { card, position } of measured) {
        const before = last.positions.get(card.dataset.recipeSlug!)
        if (before) {
          const x = before.x - position.x, y = before.y - position.y
          if (Math.abs(x) + Math.abs(y) < 1) continue
          animations.current.push(card.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: "translate(0,0)" }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" }))
        } else {
          animations.current.push(card.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }))
        }
      }
    }
    previous.current = { positions, query }
  }, [ref, state, query])
  useLayoutEffect(() => () => animations.current.forEach(animation => animation.cancel()), [])
}
