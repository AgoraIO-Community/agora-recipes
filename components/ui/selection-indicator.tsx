"use client"

import { useLayoutEffect, useRef } from "react"

export function SelectionIndicator({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const indicator = ref.current
    const group = indicator?.parentElement
    if (!indicator || !group) return
    const measure = () => {
      const selected = group.querySelector<HTMLElement>('[data-state="on"], [data-state="active"]')
      if (!selected) { delete indicator.dataset.ready; return }
      indicator.style.width = `${selected.offsetWidth}px`
      indicator.style.height = `${selected.offsetHeight}px`
      indicator.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`
      indicator.dataset.ready = "true"
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => observer.disconnect()
  }, [value])
  return <span ref={ref} className="ag-selection" aria-hidden="true" />
}
