/**
 * Bouncie API client
 * Docs: https://developer.bouncie.com
 */

const BOUNCIE_BASE = 'https://api.bouncie.dev/v1'

async function bouncieRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${BOUNCIE_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': process.env.BOUNCIE_API_KEY!,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Bouncie API error ${res.status}: ${body}`)
  }

  return res.json()
}

/**
 * Fetch current location and status for a device.
 */
export async function getDeviceStatus(deviceId: string) {
  return bouncieRequest(`/devices/${deviceId}`)
}

/**
 * Enable or disable the ignition interrupt (kill switch).
 * action: 'enable'  → prevent next ignition start
 * action: 'disable' → restore normal ignition
 *
 * IMPORTANT: This only takes effect when the ignition is OFF.
 * Never interrupts a running engine — by design.
 */
export async function setIgnitionInterrupt(
  deviceId: string,
  action: 'enable' | 'disable'
): Promise<void> {
  await bouncieRequest(`/devices/${deviceId}/starter-interrupt`, {
    method: 'POST',
    body: JSON.stringify({ enabled: action === 'enable' }),
  })
}

/**
 * Verify an incoming Bouncie webhook signature.
 * Bouncie signs payloads with HMAC-SHA256.
 */
export function verifyBouncieSignature(
  rawBody: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const expected = crypto
    .createHmac('sha256', process.env.BOUNCIE_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  )
}

export type BouncieEventType =
  | 'tripStart'
  | 'tripEnd'
  | 'hardBrake'
  | 'hardAcceleration'
  | 'speeding'
  | 'geofenceEnter'
  | 'geofenceExit'
  | 'ignitionOn'
  | 'ignitionOff'
  | 'disconnect'

export interface BouncieWebhookPayload {
  eventType: BouncieEventType
  imei: string
  transactionId: string
  data: {
    latitude: number
    longitude: number
    speed: number
    heading: number
    timestamp: string
    geofenceId?: string
    geofenceName?: string
  }
}
