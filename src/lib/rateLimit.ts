const stores = new Map<string, Map<string, number[]>>()

// Sweep out IPs whose timestamps are all older than any window in use,
// so the store can't grow without bound under many distinct client IPs.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000
const MAX_WINDOW_MS = 60 * 60 * 1000

setInterval(() => {
  const cutoff = Date.now() - MAX_WINDOW_MS
  for (const store of stores.values()) {
    for (const [ip, timestamps] of store) {
      if (timestamps.every((t) => t < cutoff)) store.delete(ip)
    }
  }
}, SWEEP_INTERVAL_MS).unref()

export function isRateLimited(bucket: string, ip: string, windowMs: number, max: number): boolean {
  const store = stores.get(bucket) ?? new Map<string, number[]>()
  stores.set(bucket, store)

  const now = Date.now()
  const timestamps = (store.get(ip) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= max) {
    store.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  store.set(ip, timestamps)
  return false
}
