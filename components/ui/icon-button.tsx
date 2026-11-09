"use client"

import type { ComponentProps } from "react"
import { Button, ButtonCount } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

/** Shared icon action: the accessible name and visible hint always agree. */
export function IconButton({ label, children, count, variant = "ghost", size = "icon", ...props }: ComponentProps<typeof Button> & { label: string; count?: number }) {
  return <Tooltip>
    <TooltipTrigger asChild><Button {...props} variant={variant} size={size} aria-label={label}>{count ? <>{children}<ButtonCount value={count} /></> : children}</Button></TooltipTrigger>
    <TooltipContent sideOffset={8}>{label}</TooltipContent>
  </Tooltip>
}
