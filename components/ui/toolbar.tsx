import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Layout only; each choice group retains its own keyboard semantics. */
function Toolbar({ className, ...props }: ComponentProps<"div">) {
  return <div role="group" data-slot="toolbar" className={cn("ag-toolbar", className)} {...props} />
}

function ToolbarActions({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="toolbar-actions" className={cn("ag-toolbar-actions", className)} {...props} />
}

export { Toolbar, ToolbarActions }
