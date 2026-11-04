"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("ag-button", {
  variants: {
    variant: {
      default: "ag-button-primary",
      primary: "ag-button-primary",
      destructive: "ag-button-danger",
      outline: "ag-button-outline",
      secondary: "ag-button-secondary",
      ghost: "ag-button-ghost",
      quiet: "ag-button-ghost",
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
  busy = false,
  busyIndicator = true,
  disabled,
  onClick,
  onClickCapture,
  type = "button",
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean; busy?: boolean; busyIndicator?: boolean }) {
  const classes = cn(buttonVariants({ variant, size, className }));
  const blocked = Boolean(disabled || busy || props["aria-disabled"] === true || props["aria-disabled"] === "true");
  const guard = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!blocked) return false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  };
  const behavior = {
    ...props,
    "aria-busy": busy || props["aria-busy"],
    "aria-disabled": blocked || undefined,
    "data-busy": busy || undefined,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => { if (!guard(event)) onClick?.(event); },
    onClickCapture: (event: React.MouseEvent<HTMLButtonElement>) => { if (!guard(event)) onClickCapture?.(event); },
  };
  if (asChild) return <Slot data-slot="button" data-variant={variant} data-size={size} className={classes} {...behavior}>{children}</Slot>;
  // Busy actions stay focusable. Capture guards also block a nested link's action.
  return <button type={type} disabled={disabled} data-slot="button" data-variant={variant} data-size={size} className={classes} data-progress={busy && busyIndicator || undefined} {...behavior}>
    {busy && busyIndicator && <LoaderCircle className="ag-button__progress" aria-hidden="true" />}
    <span className="basic-button-content">{children}</span>
  </button>;
}

export { Button, buttonVariants };
