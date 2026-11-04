"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TogglePrimitive from "@radix-ui/react-toggle";

import { cn } from "@/lib/utils";

const toggleVariants = cva("ag-toggle", {
  variants: {
    variant: { default: "", outline: "ag-toggle-outline" },
    size: {
      default: "ag-control-md",
      sm: "ag-control-sm",
      lg: "ag-control-lg",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
