"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva("ag-button", {
  variants: {
    variant: {
      default: "ag-button-primary",
      destructive: "ag-button-danger",
      outline: "ag-button-outline",
      secondary: "ag-button-secondary",
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
  type = "button",
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const classes = cn(buttonVariants({ variant, size, className }));
  if (asChild) return <Slot data-slot="button" data-variant={variant} data-size={size} className={classes} {...props}>{children}</Slot>;
  return <button type={type} data-slot="button" data-variant={variant} data-size={size} className={classes} {...props}>
    <span className="basic-button-content">{children}</span>
  </button>;
}

export { Button, buttonVariants };
