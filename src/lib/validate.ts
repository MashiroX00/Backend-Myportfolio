export function isNonEmptyString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max
}

export function isOptionalString(v: unknown, max: number): v is string | null | undefined {
  return v == null || (typeof v === "string" && v.length <= max)
}

export function isHttpUrl(v: unknown): v is string {
  if (typeof v !== "string" || v.length > 2048) return false
  try {
    const url = new URL(v)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function isOptionalHttpUrl(v: unknown): v is string | null | undefined {
  return v == null || v === "" || isHttpUrl(v)
}

export function isInt(v: unknown, min = 0, max = 1_000_000): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max
}

export function isStringArray(v: unknown, maxItems: number, maxItemLength: number): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= maxItems &&
    v.every((item) => typeof item === "string" && item.length <= maxItemLength)
  )
}

export function isReorderPayload(v: unknown): v is { id: number; position: number }[] {
  return (
    Array.isArray(v) &&
    v.length <= 500 &&
    v.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        isInt((item as Record<string, unknown>).id, 1, Number.MAX_SAFE_INTEGER) &&
        isInt((item as Record<string, unknown>).position)
    )
  )
}
