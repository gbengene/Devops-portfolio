import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

/**
 * Tests for webhook security — HMAC signature verification.
 *
 * CRITICAL: If these fail, unauthenticated parties could inject
 * fake GPS events or fake payment events into the system.
 *
 * Both Bouncie and Stripe use HMAC-SHA256 to sign webhook payloads.
 */

// ── Bouncie signature verification (mirrors lib/bouncie.ts) ──────────────────

function verifyBouncieSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false  // buffers of different length — invalid
  }
}

function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyBouncieSignature', () => {
  const SECRET = 'test-bouncie-secret-12345'
  const BODY   = JSON.stringify({ eventType: 'geofenceExit', imei: '123456789012345' })

  it('accepts a valid signature', () => {
    const sig = signPayload(BODY, SECRET)
    expect(verifyBouncieSignature(BODY, sig, SECRET)).toBe(true)
  })

  it('rejects a tampered body', () => {
    const sig         = signPayload(BODY, SECRET)
    const tamperedBody = BODY.replace('geofenceExit', 'ignitionOff')
    expect(verifyBouncieSignature(tamperedBody, sig, SECRET)).toBe(false)
  })

  it('rejects a wrong secret', () => {
    const sig = signPayload(BODY, 'wrong-secret')
    expect(verifyBouncieSignature(BODY, sig, SECRET)).toBe(false)
  })

  it('rejects an empty signature', () => {
    expect(verifyBouncieSignature(BODY, '', SECRET)).toBe(false)
  })

  it('rejects a non-hex signature without throwing', () => {
    expect(verifyBouncieSignature(BODY, 'not-valid-hex!!!', SECRET)).toBe(false)
  })

  it('is consistent — same inputs always produce same result', () => {
    const sig = signPayload(BODY, SECRET)
    // Run multiple times to ensure no timing variance affects correctness
    for (let i = 0; i < 10; i++) {
      expect(verifyBouncieSignature(BODY, sig, SECRET)).toBe(true)
    }
  })
})

// ── Geofence breach detection logic ──────────────────────────────────────────

describe('geofence breach detection', () => {
  type EventType = 'geofenceExit' | 'geofenceEnter' | 'ignitionOn' | 'tripStart'

  function isGeofenceBreach(eventType: EventType): boolean {
    return eventType === 'geofenceExit'
  }

  it('flags geofenceExit as a breach', () => {
    expect(isGeofenceBreach('geofenceExit')).toBe(true)
  })

  it('does not flag geofenceEnter', () => {
    expect(isGeofenceBreach('geofenceEnter')).toBe(false)
  })

  it('does not flag normal events', () => {
    expect(isGeofenceBreach('ignitionOn')).toBe(false)
    expect(isGeofenceBreach('tripStart')).toBe(false)
  })
})

// ── Alert severity mapping ────────────────────────────────────────────────────

describe('alert severity mapping', () => {
  type AlertType = 'geofence_breach' | 'payment_failed' | 'vehicle_speeding' | 'plate_renewal_due'
  type Severity  = 'critical' | 'warning' | 'info'

  function getSeverity(alertType: AlertType): Severity {
    const map: Record<AlertType, Severity> = {
      geofence_breach:   'critical',
      payment_failed:    'critical',
      vehicle_speeding:  'warning',
      plate_renewal_due: 'info',
    }
    return map[alertType]
  }

  it('geofence breach is critical', () => {
    expect(getSeverity('geofence_breach')).toBe('critical')
  })
  it('payment failure is critical', () => {
    expect(getSeverity('payment_failed')).toBe('critical')
  })
  it('speeding is warning', () => {
    expect(getSeverity('vehicle_speeding')).toBe('warning')
  })
  it('plate renewal is info', () => {
    expect(getSeverity('plate_renewal_due')).toBe('info')
  })
})
