import Link from 'next/link';
import { AgoraLogo } from '@/components/agora-logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5 text-sm">
            <AgoraLogo className="h-5 w-5 text-primary" />
            <span className="font-medium">Agora Voice AI Recipes</span>
            <span className="text-muted-foreground">· Built with Agora</span>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <Link
              href="https://docs.agora.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/AgoraIO-Community/v0-voice-ai-recipes"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://www.agora.io/en/products/conversational-ai-engine/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Conversational AI
            </Link>
            <Link
              href="https://console.agora.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Console
            </Link>
          </nav>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()}{' '}
          <a href="https://www.agora.io" target="_blank">
            Agora
          </a>
          . All recipes MIT licensed.
        </p>
      </div>
    </footer>
  );
}
