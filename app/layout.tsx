import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Instrument_Sans, Space_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

const jokker = localFont({
  src: [
    {
      path: "../public/font/Jokker-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/Jokker-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/Jokker-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/Jokker-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-brand",
  display: "swap",
})

const shouldLoadAnalytics =
  process.env.NODE_ENV === "production" && process.env.VERCEL === "1"

export const metadata: Metadata = {
  title: {
    default: "Agora Voice AI Recipes",
    template: "%s · Agora Voice AI Recipes",
  },
  description:
    "Open-source recipes for building voice agents, transcription, translation, and accessibility workflows with Agora.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/agora-icon-rgb-blue.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/agora-icon-rgb-blue.svg",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
      className={`${instrumentSans.variable} ${spaceMono.variable} ${jokker.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-svh flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          forcedTheme="system"
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
        {shouldLoadAnalytics && <Analytics />}
      </body>
    </html>
  )
}
