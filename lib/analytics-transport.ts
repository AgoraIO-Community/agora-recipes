// One transport belongs to one uninterrupted grant. Retry requests retain its
// fetch options, so withdrawing (or granting again) cannot revive old payloads.
export function createConsentTransport(isGranted: () => boolean) {
  const grant = new AbortController()
  const options = {
    cache: "no-store" as const,
    get signal() {
      if (!isGranted()) grant.abort()
      if (grant.signal.aborted) return grant.signal
      if (typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function") {
        return AbortSignal.any([grant.signal, AbortSignal.timeout(60_000)])
      }
      const request = new AbortController()
      const abort = () => request.abort()
      const timeout = setTimeout(abort, 60_000)
      grant.signal.addEventListener("abort", abort, { once: true })
      request.signal.addEventListener("abort", () => {
        clearTimeout(timeout)
        grant.signal.removeEventListener("abort", abort)
      }, { once: true })
      return request.signal
    },
  }
  return { options, abort: () => grant.abort(), get aborted() { return grant.signal.aborted } }
}
