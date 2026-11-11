'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib/utils'
import { GlassSurface } from '@/components/design-system/glass-surface'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useI18n } from '@/components/locale-provider'

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  children,
  align = 'center',
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        asChild
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'ag-glass-panel ag-popover-panel',
          className,
        )}
        {...props}
      ><GlassSurface material="liquid">{children}</GlassSurface></PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { t } = useI18n()
  return <div data-slot="popover-header" className={cn('ag-panel-header', className)} {...props}>
    <div className="ag-panel-heading">{children}</div>
    <PopoverPrimitive.Close asChild><Button variant="ghost" size="icon" aria-label={t("Close")}><X aria-hidden="true" /></Button></PopoverPrimitive.Close>
  </div>
}
function PopoverTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="popover-title" className={cn('ag-panel-title', className)} {...props} />
}
function PopoverBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-body" className={cn('ag-panel-body', className)} {...props} />
}
function PopoverFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-footer" className={cn('ag-panel-footer', className)} {...props} />
}
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverBody, PopoverFooter }
