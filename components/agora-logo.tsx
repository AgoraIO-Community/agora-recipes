import { cn } from "@/lib/utils"

/**
 * Agora brand mark from `public/agora-icon-rgb-blue.svg`.
 * Decorative — the parent <Link> carries the accessible label.
 */
export function AgoraLogo({ className }: { className?: string }) {
  return (
    <img
      src="/agora-icon-rgb-blue.svg"
      alt=""
      className={cn("shrink-0", className)}
      aria-hidden="true"
      width={183}
      height={184}
    />
  )
}
