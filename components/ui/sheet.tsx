'use client'

import { useI18n } from "@/components/locale-provider"
import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassSurface } from '@/components/design-system/glass-surface'

const SheetPanelContext = React.createContext<{ closeLabel?: string }>({})

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'liquid-modal-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  closeLabel,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  closeLabel?: string
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        asChild
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'ag-glass-panel ag-sheet-panel',
          className,
        )}
        {...props}
      >
        <GlassSurface material="liquid">
          <SheetPanelContext.Provider value={{ closeLabel }}>{children}</SheetPanelContext.Provider>
        </GlassSurface>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, children, actions, ...props }: React.ComponentProps<'div'> & { actions?: React.ReactNode }) {
  const { t } = useI18n()
  const { closeLabel } = React.useContext(SheetPanelContext)
  return (
    <div
      data-slot="sheet-header"
      className={cn('ag-panel-header', className)}
      {...props}
    >
      <div className="ag-panel-heading">{children}</div>
      {actions}
      <SheetPrimitive.Close asChild><Button variant="ghost" size="icon" aria-label={closeLabel ?? t("Close")}><XIcon aria-hidden="true" /></Button></SheetPrimitive.Close>
    </div>
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-body" className={cn('ag-panel-body', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('ag-panel-footer', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('ag-panel-title', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('ag-panel-description', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
