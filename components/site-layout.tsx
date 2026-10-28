import { analyticsEnabled } from "@/lib/analytics-events"
import { AnalyticsProvider } from "@/components/analytics-provider"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { LocaleProvider } from "@/components/locale-provider"
import { getMessages, getT } from "@/lib/i18n"
import type { Locale } from "@/lib/locales"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { siteUrl } from "@/lib/site"
import { themeInitScript } from "@/lib/theme"

const shouldLoadAnalytics =
  analyticsEnabled(process.env.NODE_ENV, process.env.VERCEL, process.env.VERCEL_ENV)

const baseMetadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Agora Voice AI Recipes",
    template: "%s · Agora Voice AI Recipes",
  },
  description:
    "Open-source recipes for building voice agents, transcription, translation, and accessibility workflows with Agora.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-196x196.png", sizes: "196x196", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-touch-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-touch-icon-167x167.png", sizes: "167x167" },
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Agora Voice AI Recipes",
    description:
      "Build voice agents, transcription, translation, and accessibility workflows with Agora.",
    type: "website",
  },
}

export function siteMetadata(locale: Locale): Metadata {
  const t = getT(locale)
  return { ...baseMetadata, description: t(String(baseMetadata.description)), openGraph: { ...baseMetadata.openGraph, description: t("Build voice agents, transcription, translation, and accessibility workflows with Agora.") } }
}
export const metadata = siteMetadata("en")

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children, locale = "en",
}: Readonly<{
  children: React.ReactNode; locale?: Locale
}>) {
  const t = getT(locale)
  return (
    <html
      lang={locale}
      data-theme="dark"
      data-scroll-behavior="smooth"
      className="dark bg-background"
      suppressHydrationWarning
    >
      {/* Shared document markup used by both Next.js root layouts. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <link rel="describedby" href="/llms.txt" />
        <meta name="color-scheme" content="dark light" />
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preload" href="/font/MiSansLatin-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body id="page-top" className="font-sans antialiased min-h-svh flex flex-col">
        <a href="#main-content" className="skip-link">
          {t("Skip to main content")}
        </a>
        <LocaleProvider locale={locale} messages={getMessages(locale)}>
        <AnalyticsProvider enabled={shouldLoadAnalytics}>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        </AnalyticsProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
