"use client"

import { useLayoutEffect, useRef } from "react"

export function SelectionIndicator({ value, appearance = "surface" }: { value: string; appearance?: "surface" | "underline" }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const indicator = ref.current
    const group = indicator?.parentElement
    if (!indicator || !group) return
    const measure = () => {
      const selected = group.querySelector<HTMLElement>('[data-state="on"], [data-state="active"]')
      if (!selected) { delete indicator.dataset.ready; return }
      indicator.style.width = `${selected.offsetWidth}px`
      indicator.style.height = `${appearance === "underline" ? 2 : selected.offsetHeight}px`
      indicator.style.transform = `translate(${selected.offsetLeft}px, ${appearance === "underline" ? group.clientHeight - 1 : selected.offsetTop}px)`
      indicator.dataset.ready = "true"
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => observer.disconnect()
  }, [value, appearance])
  return <span ref={ref} className={`ag-selection${appearance === "underline" ? " ag-selection--underline" : ""}`} aria-hidden="true" />
}
