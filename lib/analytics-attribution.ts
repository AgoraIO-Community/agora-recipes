import { campaignKeys, campaignProperties, type Campaign } from "./analytics-events"

const storageKey = "recipes:campaign:v1"
const inactivityTimeout = 30 * 60 * 1000
type AttributionState = { lastActivity: number; campaign: Campaign }
type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">

// Per-tab last tagged touch. Untagged navigation keeps the campaign until the
// inactivity timeout; an explicit campaign replaces the whole previous set.
// There is no user identifier, first-touch profile, or raw landing URL here.
export function createAttributionReader(storage: () => StorageAccess, now = Date.now) {
  let state: AttributionState | undefined
  let restored = false
  const read = (search: string): Campaign => {
    const time = now()
    if (!restored) {
      restored = true
      try {
        const saved = JSON.parse(storage().getItem(storageKey) ?? "null")
        if (saved && Number.isFinite(saved.lastActivity) && saved.campaign && typeof saved.campaign === "object") {
          state = { lastActivity: saved.lastActivity, campaign: campaignProperties(saved.campaign) }
        }
      } catch { /* Disabled or corrupt storage falls back to this document. */ }
    }
    const params = new URLSearchParams(search)
    const tagged = campaignProperties(Object.fromEntries(campaignKeys.map(key => [key, params.get(key)])))
    const active = state && time >= state.lastActivity && time - state.lastActivity < inactivityTimeout
    state = { lastActivity: time, campaign: Object.keys(tagged).length ? tagged : active ? state!.campaign : {} }
    try { storage().setItem(storageKey, JSON.stringify(state)) } catch { /* Analytics cannot block navigation. */ }
    return { ...state.campaign }
  }
  read.clear = () => {
    state = undefined
    restored = true
    try { storage().removeItem(storageKey) } catch { /* Storage may be disabled. */ }
  }
  return read
}
