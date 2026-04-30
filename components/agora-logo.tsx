import { cn } from "@/lib/utils"

/**
 * Stylized voice/sound mark used as the site logo.
 * Decorative — the parent <Link> carries the accessible label.
 */
export function AgoraLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M4 12v0" />
      <path d="M8 9v6" />
      <path d="M12 6v12" />
      <path d="M16 9v6" />
      <path d="M20 12v0" />
    </svg>
  )
}
