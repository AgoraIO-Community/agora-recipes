"use client"

import { useSyncExternalStore, type ComponentPropsWithRef } from "react"
import { attributedDestination, browserAttribution } from "@/lib/utm-attribution"

const subscribe = (callback: () => void) => {
  window.addEventListener("pageshow", callback)
  return () => window.removeEventListener("pageshow", callback)
}

/** Native anchor semantics include keyboard, middle-click and Copy link address. */
export function AttributionLink({ href, ...props }: ComponentPropsWithRef<"a"> & { href: string }) {
  const destination = useSyncExternalStore(subscribe,
    () => attributedDestination(href, browserAttribution()?.get()),
    () => href)
  return <a {...props} href={destination} />
}
