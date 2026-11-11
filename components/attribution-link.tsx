"use client"

import { useSyncExternalStore, type ComponentPropsWithRef } from "react"
import { attributedDestination } from "@/lib/analytics-attribution"
import { attributionStore } from "@/lib/browser-attribution"

/** Native anchor semantics include keyboard, middle-click and Copy link address. */
export function AttributionLink({ href, ...props }: ComponentPropsWithRef<"a"> & { href: string }) {
  const attribution = useSyncExternalStore(attributionStore.subscribe, attributionStore.getSnapshot, () => undefined)
  const destination = attributedDestination(href, attribution)
  return <a {...props} href={destination} />
}
