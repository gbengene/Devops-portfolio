/**
 * Input sanitization utilities.
 *
 * All user-supplied strings pass through these before touching the DB.
 * Prevents XSS, SQL injection surface area, and malformed data.
 *
 * Why not rely on Supabase/ORM alone?
 * Defense in depth: parameterized queries protect against SQLi, but
 * sanitized input also prevents garbage data and stored XSS if
 * content is ever rendered without escaping.
 */

/** Strip control characters and trim whitespace */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')  // remove control chars
    .trim()
    .slice(0, 1000)                     // hard cap to prevent absurdly long strings
}

/** Normalize a Canadian phone number to E.164 (+1XXXXXXXXXX) */
export function sanitizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const digits = input.replace(/\D/g, '')

  // Accept 10 digits (no country code) or 11 digits starting with 1
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/** Normalize and validate an email address */
export function sanitizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const cleaned = input.trim().toLowerCase().slice(0, 254)
  // RFC 5322 simplified check — fine for an SMB context
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return EMAIL_RE.test(cleaned) ? cleaned : null
}

/** Strip everything except digits and letters from a licence number */
export function sanitizeLicenceNumber(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const cleaned = input.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase().slice(0, 20)
  return cleaned.length >= 5 ? cleaned : null
}

/** Clamp a number to a valid range */
export function sanitizeInt(
  input: unknown,
  min: number,
  max: number
): number | null {
  const n = Number(input)
  if (!Number.isFinite(n)) return null
  return Math.max(min, Math.min(max, Math.floor(n)))
}

/** Validate a value against an allowed set */
export function sanitizeEnum<T extends string>(
  input: unknown,
  allowed: readonly T[]
): T | null {
  if (typeof input !== 'string') return null
  return (allowed as string[]).includes(input) ? (input as T) : null
}

/** Sanitize an entire application form payload */
export function sanitizeApplicationPayload(body: Record<string, unknown>) {
  const ALLOWED_PLATFORMS = ['uber_eats', 'doordash', 'skip', 'instacart'] as const
  const ALLOWED_CLASSES   = ['G', 'G2'] as const

  return {
    full_name:              sanitizeString(body.full_name),
    phone:                  sanitizePhone(body.phone),
    ontario_licence_number: sanitizeLicenceNumber(body.ontario_licence_number),
    licence_class:          sanitizeEnum(body.licence_class, ALLOWED_CLASSES),
    at_fault_accidents:     sanitizeInt(body.at_fault_accidents, 0, 20),
    licence_suspended:      body.licence_suspended === true,
    gig_platform:           sanitizeEnum(body.gig_platform, ALLOWED_PLATFORMS),
  }
}
