import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("ag-badge", {
  variants: { variant: { default: "ag-badge-signal", secondary: "ag-badge-neutral", outline: "ag-badge-outline", destructive: "ag-badge-danger", ghost: "ag-badge-ghost", link: "ag-badge-link", announcement: "ag-badge-announcement" } },
  defaultVariants: { variant: "secondary" },
})
function Badge({ className, variant, shape = "label", asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { shape?: "label" | "ribbon"; asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"
  if (shape === "ribbon") return <span data-slot="badge-frame" className={cn("ag-corner-ribbon", className)}><Comp data-slot="badge" className={cn(badgeVariants({ variant }), "ag-badge-ribbon")} {...props} /></span>
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
