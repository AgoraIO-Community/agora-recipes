import type { ComponentProps, ReactNode } from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Disclosure({ className, ...props }: ComponentProps<"details">) {
  return <details data-slot="disclosure" className={cn("ag-disclosure", className)} {...props} />
}

function DisclosureTrigger({ className, children, meta, ...props }: ComponentProps<"summary"> & { meta?: ReactNode }) {
  return <summary data-slot="disclosure-trigger" className={cn("ag-disclosure-trigger", className)} {...props}>{children}<span className="ag-disclosure-meta">{meta}<ChevronDown aria-hidden="true" /></span></summary>
}

function DisclosureContent({ className, asChild = false, ...props }: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return <Comp data-slot="disclosure-content" className={cn("ag-disclosure-content", className)} {...props} />
}

export { Disclosure, DisclosureTrigger, DisclosureContent }
