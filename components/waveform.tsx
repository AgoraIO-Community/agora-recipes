import { cn } from "@/lib/utils"

/**
 * Decorative animated waveform. Heights and delays are deterministic so SSR
 * matches the client.
 */
export function Waveform({
  bars = 24,
  className,
}: {
  bars?: number
  className?: string
}) {
  // Deterministic pseudo-random pattern.
  const heights = Array.from({ length: bars }, (_, i) => {
    const t = (i / bars) * Math.PI * 2
    const v = 0.45 + 0.55 * Math.abs(Math.sin(t * 1.7 + i * 0.6))
    return Math.round(v * 100)
  })

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center gap-[3px]",
        className,
      )}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="wave-bar block w-[3px] rounded-full bg-primary/70"
          style={{
            height: `${h}%`,
            animationDelay: `${(i % 8) * 0.12}s`,
            animationDuration: `${1 + (i % 5) * 0.18}s`,
          }}
        />
      ))}
    </div>
  )
}
