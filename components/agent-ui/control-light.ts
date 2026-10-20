import type { PointerEvent } from "react";

export function trackControlLight(
  event: PointerEvent<HTMLElement>,
  enabled = true,
) {
  if (
    !enabled ||
    event.defaultPrevented ||
    event.pointerType !== "mouse" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  event.currentTarget.style.setProperty("--control-light-x", `${x}%`);
}

export function clearControlLight(
  event: PointerEvent<HTMLElement>,
  enabled = true,
) {
  if (enabled)
    event.currentTarget.style.removeProperty("--control-light-x");
}
