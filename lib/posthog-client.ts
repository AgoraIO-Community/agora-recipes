"use client"

import { sanitizePosthogEvent } from "./posthog-events"
import { analyticsOriginAllowed, campaignKeys } from "./analytics-events"
import { analyticsConsent } from "./analytics-consent"
import { createConsentTransport } from "./analytics-transport"

let client: Promise<typeof import("posthog-js/dist/module.slim").default | undefined> | undefined
let transport: ReturnType<typeof createConsentTransport> | undefined
let appliedTransport: typeof transport

function clearRecipesPersistence() {
  if (typeof window === "undefined") return
  const owned = (key: string) => key === "ph_recipes" || key.startsWith("ph_recipes_") || key === "recipes:posthog-consent"
  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[name]
      for (let index = storage.length - 1; index >= 0; index--) {
        const key = storage.key(index)
        if (key && owned(key)) storage.removeItem(key)
      }
    } catch { /* Restricted storage cannot prevent a privacy choice. */ }
  }
  // These cookies are host-only. Never remove the shared project-token cookie
  // on .agora.io, which may belong to Console or another Agora application.
  try {
    for (const cookie of window.document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim()
      if (owned(name)) window.document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
    }
  } catch { /* Cookies may be blocked. */ }
}

export function syncPosthogConsent() {
  if (!analyticsConsent.isGranted()) {
    transport?.abort()
    transport = undefined
    clearRecipesPersistence()
  }
  void client?.then(posthog => {
    if (posthog && !analyticsConsent.isGranted()) posthog.opt_out_capturing()
  }).catch(() => {})
}

export function capturePosthog(event: string, properties: Record<string, unknown>, productionOrigin: string) {
  if (typeof window === "undefined" || !analyticsOriginAllowed(window.location.href, productionOrigin) || !analyticsConsent.isGranted()) return
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
  if (!token) return
  if (!transport || transport.aborted) transport = createConsentTransport(analyticsConsent.isGranted)
  const grant = transport
  // Both the server deployment gate and the browser origin gate must pass
  // before loading the SDK, including its initialization requests.
  client ??= import("posthog-js/dist/module.slim").then(({ default: posthog }) => {
    if (!analyticsConsent.isGranted() || !transport || transport.aborted) { client = undefined; return undefined }
    appliedTransport = transport
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
      persistence_name: "recipes",
      consent_persistence_name: "recipes:posthog-consent",
      cross_subdomain_cookie: false,
      cookie_expiration: 180,
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      request_batching: false,
      api_transport: "fetch",
      disable_beacon: true,
      fetch_options: transport.options,
      save_referrer: false,
      save_campaign_params: false,
      before_send: event => analyticsConsent.isGranted() ? sanitizePosthogEvent(event) : null,
    })
    return posthog
  })
  // Queue the first view/actions during the lazy import. A blocked analytics
  // request must not interrupt navigation, clipboard feedback, or contribution.
  // Replace SDK campaign super-properties, including ones saved by older builds.
  const campaignDefaults = Object.fromEntries(campaignKeys.map(key => [key, undefined]))
  void client.then(posthog => {
    if (!posthog || !analyticsConsent.isGranted() || transport !== grant || grant.aborted) return
    if (appliedTransport !== grant) { posthog.set_config({ fetch_options: grant.options }); appliedTransport = grant }
    if (!posthog.has_opted_in_capturing()) posthog.opt_in_capturing({ captureEventName: false })
    posthog.capture(event, { ...campaignDefaults, ...properties })
  }).catch(() => {})
}
