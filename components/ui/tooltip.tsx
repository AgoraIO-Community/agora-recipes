'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

function TooltipProvider({
  delayDuration = 350,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

// Tooltip metadata must not replace the composed control's slot or state.
const TooltipTarget = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<typeof Slot> & { 'data-state'?: string; 'data-slot'?: string }>(function TooltipTarget(props, ref) {
  const targetProps = { ...props }
  delete targetProps['data-state']
  delete targetProps['data-slot']
  return <Slot {...targetProps} ref={ref} />
})

function TooltipTrigger({
  asChild, children, ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return asChild
    ? <TooltipPrimitive.Trigger asChild {...props}><TooltipTarget>{children}</TooltipTarget></TooltipPrimitive.Trigger>
    : <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props}>{children}</TooltipPrimitive.Trigger>
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'ag-tooltip-content',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-foreground" width={8} height={4} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
