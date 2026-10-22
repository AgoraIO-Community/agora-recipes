import { cn } from "@/lib/utils"

/**
 * Agora brand mark from `public/agora-icon-rgb-blue-v2.svg`.
 * Decorative — the parent <Link> carries the accessible label.
 */
export function AgoraLogo({ className }: { className?: string }) {
  return (
    <img
      src="/agora-wordmark.svg"
      alt=""
      className={cn("agora-wordmark shrink-0", className)}
      aria-hidden="true"
      width={86}
      height={30}
    />
  )
}
