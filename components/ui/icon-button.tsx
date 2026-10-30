"use client"

import type { ComponentProps } from "react"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

/** Shared icon action: the accessible name and visible hint always agree. */
export function IconButton({ label, children, variant = "ghost", size = "icon", ...props }: Omit<ComponentProps<typeof Button>, "asChild"> & { label: string }) {
  return <Tooltip>
    <TooltipTrigger asChild><Button {...props} variant={variant} size={size} aria-label={label}>{children}</Button></TooltipTrigger>
    <TooltipContent sideOffset={8}>{label}</TooltipContent>
  </Tooltip>
}
