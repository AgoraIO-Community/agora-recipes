"use client"

import { sanitizePosthogEvent } from "./posthog-events"

let client: Promise<typeof import("posthog-js/dist/module.slim").default> | undefined

export function capturePosthog(event: string, properties: Record<string, unknown>) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!token || !host) return
  // This function is called only behind the server's real-production gate.
  client ??= import("posthog-js/dist/module.slim").then(({ default: posthog }) => {
    posthog.init(token, {
      api_host: host,
      ui_host: "https://us.posthog.com",
      defaults: "2026-08-30",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      capture_performance: false,
      capture_exceptions: false,
      disable_session_recording: true,
      advanced_disable_flags: true,
      person_profiles: "never",
      save_referrer: false,
      before_send: sanitizePosthogEvent,
    })
    return posthog
  })
  // Queue the first view/actions during the lazy import. A blocked analytics
  // request must not interrupt navigation, clipboard feedback, or contribution.
  void client.then(posthog => posthog.capture(event, properties)).catch(() => {})
}
