"use client"

import { sanitizePosthogEvent } from "./posthog-events"
import { analyticsOriginAllowed, campaignKeys } from "./analytics-events"

let client: Promise<typeof import("posthog-js/dist/module.slim").default> | undefined

export function capturePosthog(event: string, properties: Record<string, unknown>, productionOrigin: string) {
  if (typeof window === "undefined" || !analyticsOriginAllowed(window.location.href, productionOrigin)) return
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
  if (!token) return
  // Both the server deployment gate and the browser origin gate must pass
  // before loading the SDK, including its initialization requests.
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
      save_campaign_params: false,
      before_send: sanitizePosthogEvent,
    })
    return posthog
  })
  // Queue the first view/actions during the lazy import. A blocked analytics
  // request must not interrupt navigation, clipboard feedback, or contribution.
  // Replace SDK campaign super-properties, including ones saved by older builds.
  const campaignDefaults = Object.fromEntries(campaignKeys.map(key => [key, undefined]))
  void client.then(posthog => posthog.capture(event, { ...campaignDefaults, ...properties })).catch(() => {})
}
