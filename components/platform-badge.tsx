import { Globe, Smartphone } from "lucide-react"
import type { Platform } from "@/lib/recipes"
import { cn } from "@/lib/utils"

const ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  Web: Globe,
  iOS: Smartphone,
  Android: Smartphone,
}

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform
  className?: string
}) {
  const Icon = ICONS[platform]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {platform}
    </span>
  )
}

export function PlatformBadgeList({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((p) => (
        <PlatformBadge key={p} platform={p} />
      ))}
    </div>
  )
}
