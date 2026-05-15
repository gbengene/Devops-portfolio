import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyBouncieSignature, type BouncieWebhookPayload } from '@/lib/bouncie'
import { notify } from '@/lib/notifications'

/**
 * POST /api/webhooks/bouncie
 *
 * Receives GPS and geofence events from Bouncie.
 * Verified via HMAC signature before any processing.
 *
 * Critical events handled:
 *  - geofenceExit  → insert critical alert, SMS admin
 *  - ignitionOn/Off → insert GPS event
 *  - speeding       → insert warning alert
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-bouncie-signature') ?? ''

  // Security: reject unverified webhooks immediately
  if (!verifyBouncieSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: BouncieWebhookPayload = JSON.parse(rawBody)
  const supabase = createAdminClient()

  // Resolve vehicle by Bouncie IMEI
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, plate_number')
    .eq('bouncie_device_id', payload.imei)
    .single()

  if (vehicleError || !vehicle) {
    // Unknown device — log and return 200 to stop Bouncie retrying
    console.warn(`Unknown Bouncie device IMEI: ${payload.imei}`)
    return NextResponse.json({ received: true })
  }

  const { data: eventData } = payload
  const isGeofenceBreach = payload.eventType === 'geofenceExit'

  // Persist GPS event
  await supabase.from('gps_events').insert({
    vehicle_id:       vehicle.id,
    event_type:       payload.eventType,
    lat:              eventData.latitude,
    lng:              eventData.longitude,
    speed_kmh:        eventData.speed,
    geofence_breach:  isGeofenceBreach,
    raw_payload:      payload as unknown as Record<string, unknown>,
    occurred_at:      eventData.timestamp,
  })

  // ── Geofence breach — critical path ──────────────────────────────────────
  if (isGeofenceBreach) {
    // Find the active rental for this vehicle
    const { data: rental } = await supabase
      .from('rentals')
      .select('id')
      .eq('vehicle_id', vehicle.id)
      .eq('status', 'active')
      .single()

    await supabase.from('alerts').insert({
      vehicle_id: vehicle.id,
      rental_id:  rental?.id ?? null,
      type:       'geofence_breach',
      severity:   'critical',
      message:    `Vehicle ${vehicle.plate_number} has exited the Ontario geofence boundary.`,
      metadata:   { lat: eventData.latitude, lng: eventData.longitude, geofenceId: eventData.geofenceId },
    })

    await notify.geofenceBreach({
      plate: vehicle.plate_number,
      lat:   eventData.latitude,
      lng:   eventData.longitude,
    })
  }

  // ── Speeding alert (>130 km/h) ────────────────────────────────────────────
  if (payload.eventType === 'speeding' && eventData.speed > 130) {
    await supabase.from('alerts').insert({
      vehicle_id: vehicle.id,
      type:       'vehicle_speeding',
      severity:   'warning',
      message:    `Vehicle ${vehicle.plate_number} recorded at ${eventData.speed} km/h.`,
      metadata:   { speed_kmh: eventData.speed, lat: eventData.latitude, lng: eventData.longitude },
    })
  }

  return NextResponse.json({ received: true })
}
