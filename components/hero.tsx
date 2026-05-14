import Link from "next/link"
import { ArrowRight, Github, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
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

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
            Voice AI recipes,{" "}
            <span className="text-primary">ready to ship.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl leading-relaxed">
            Open-source samples for real-time voice agents, transcription,
            translation, and more — running on Agora's global low-latency
            network. Drop an{" "}
            <code className="font-mono text-sm rounded bg-muted px-1.5 py-0.5 border border-border">
              Agent.md
            </code>{" "}
            into your project — or fork the repo — and ship in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Button asChild size="lg" className="h-11 gap-2">
              <Link href="#recipes">
                Browse recipes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 gap-2">
              <Link
                href="https://github.com/AgoraIO-Community/voice-ai-recipes"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Live waveform accent */}
          <div className="mt-8 w-full max-w-md h-14" aria-hidden="true">
            <Waveform bars={48} />
          </div>
        </div>

      </div>
    </section>
  )
}
