import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Waveform } from "@/components/waveform"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" aria-hidden="true" />

      {/* Soft glow */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-[480px] w-[820px] rounded-full bg-primary/15 blur-3xl animate-pulse-soft pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <Link
            href="https://www.agora.io/en/products/conversational-ai-engine/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            Powered by Agora Conversational AI Engine
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>

          <h1 className="page-hero__title font-brand text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
            Voice AI recipes,{" "}
            <span className="text-primary">ready to ship.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl leading-relaxed">
            Build voice agents, transcription, and translation workflows on
            Agora&apos;s low-latency network. Drop a recipe prompt into your
            coding agent or fork the repo to start from working code.
          </p>

          {/* Live waveform accent */}
          <div className="mt-4 h-14 w-full max-w-md sm:mt-6" aria-hidden="true">
            <Waveform bars={48} />
          </div>
        </div>

      </div>
    </section>
  )
}
