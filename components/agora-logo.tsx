import { cn } from "@/lib/utils"

/**
 * Agora brand mark from `public/agora-icon-rgb-blue-v2.svg`.
 * Decorative — the parent <Link> carries the accessible label.
 */
export function AgoraLogo({ className }: { className?: string }) {
  return (
    <img
      src="/agora-icon-rgb-blue-v2.svg"
      alt=""
      className={cn("shrink-0", className)}
      aria-hidden="true"
      width={144}
      height={144}
    />
  )
}
