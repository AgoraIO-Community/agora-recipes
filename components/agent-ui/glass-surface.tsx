"use client";

import {
  useEffect,
  useCallback,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export type GlassMaterial = "liquid" | "frosted" | "solid";

// Geometry only: channel ramps bend the sampled backdrop toward a neutral core.
// The mechanism was inspected on OpenDesign's public header; the 12px contour
// and independent foreground belong to this system, not its capsule navigation.
export function makeDisplacementMap(
  width: number,
  height: number,
  radius: number,
) {
  const inset = 2;
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="r" x1="1" x2="0" y1="0" y2="0" gradientUnits="objectBoundingBox"><stop stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient></defs><rect width="100%" height="100%" fill="#000"/><rect width="100%" height="100%" rx="${radius}" fill="url(#r)"/><rect width="100%" height="100%" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/><rect x="${inset}" y="${inset}" width="${width - 2 * inset}" height="${height - 2 * inset}" rx="${Math.max(0, radius - inset)}" fill="#808080" fill-opacity=".96" style="filter:blur(8px)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(source)}`;
}

export function GlassSurface({
  children,
  className,
  style,
  material,
  onPointerMove,
  onPointerLeave,
  ref: forwardedRef,
  ...props
}: ComponentProps<"div"> & { material?: GlassMaterial }) {
  const id = `glass-${useId().replaceAll(":", "").replaceAll("«", "").replaceAll("»", "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const attachRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (typeof forwardedRef === "function") return forwardedRef(node);
      if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const [map, setMap] = useState("");
  useEffect(() => {
    const node = ref.current;
    if (!node || !("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(() => {
      const width = Math.max(8, Math.round(node.offsetWidth));
      const height = Math.max(8, Math.round(node.offsetHeight));
      const radius = parseFloat(getComputedStyle(node).borderRadius) || 12;
      setMap(makeDisplacementMap(width, height, radius));
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, []);
  return (
    <div
      {...props}
      ref={attachRef}
      data-slot="glass-surface"
      data-material={material}
      className={cn("ag-glass", className)}
      style={
        {
          "--glass-filter": map
            ? `url("#${id}") blur(5px) saturate(1.4)`
            : undefined,
          ...style,
        } as CSSProperties
      }
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (
          event.defaultPrevented ||
          event.pointerType !== "mouse" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const node = event.currentTarget;
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          node.style.setProperty("--light-x", `${x}%`);
          node.style.setProperty("--light-y", `${y}%`);
        });
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        cancelAnimationFrame(frame.current);
        event.currentTarget.style.removeProperty("--light-x");
        event.currentTarget.style.removeProperty("--light-y");
      }}
    >
      <svg className="ag-filter-defs" aria-hidden="true">
        <defs>
          <filter
            id={id}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map || undefined}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-50"
              result="r"
            />
            <feColorMatrix
              in="r"
              type="matrix"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-47"
              result="g"
            />
            <feColorMatrix
              in="g"
              type="matrix"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-44"
              result="b"
            />
            <feColorMatrix
              in="b"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="rgb" />
            <feGaussianBlur in="rgb" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
}
