import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("ag-badge", {
  variants: { variant: { default: "ag-badge-signal", secondary: "ag-badge-neutral", outline: "ag-badge-outline", destructive: "ag-badge-danger", ghost: "ag-badge-ghost", link: "ag-badge-link" } },
  defaultVariants: { variant: "secondary" },
})
function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
