"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { clearControlLight, trackControlLight } from "./control-light";

const buttonVariants = cva("ag-button", {
  variants: {
    variant: {
      default: "ag-button-primary",
      destructive: "ag-button-danger",
      outline: "ag-button-outline",
      secondary: "ag-button-secondary",
      glass: "ag-button-glass",
      "glass-primary": "ag-button-glass ag-button-glass-primary",
      ghost: "ag-button-ghost",
      link: "ag-button-link",
    },
    size: {
      default: "ag-control-md",
      sm: "ag-control-sm",
      lg: "ag-control-lg",
      xs: "ag-control-sm",
      icon: "ag-control-md ag-icon-button",
      "icon-sm": "ag-control-sm ag-icon-button",
      "icon-lg": "ag-control-lg ag-icon-button",
      "icon-xs": "ag-control-sm ag-icon-button",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onPointerMove,
  onPointerLeave,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const supportsInteractiveLight = variant !== "link";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        trackControlLight(event, supportsInteractiveLight);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        clearControlLight(event, supportsInteractiveLight);
      }}
      {...props}
    />
  );
}

export { Button, buttonVariants };
