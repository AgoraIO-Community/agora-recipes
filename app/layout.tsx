import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { siteUrl } from "@/lib/site"

const shouldLoadAnalytics =
  process.env.NODE_ENV === "production" && process.env.VERCEL === "1"

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className="dark bg-background"
    >
      <head>
        <link rel="describedby" href="/llms.txt" />
        <meta name="color-scheme" content="dark" />
        <link rel="preload" href="/font/MiSansLatin-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased min-h-svh flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {shouldLoadAnalytics && <Analytics />}
      </body>
    </html>
  )
}
