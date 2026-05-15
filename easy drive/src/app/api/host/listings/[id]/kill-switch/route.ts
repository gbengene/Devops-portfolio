import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { setIgnitionInterrupt } from '@/lib/bouncie'
import { z } from 'zod'

const KillSwitchSchema = z.object({
  action: z.literal('disable'),  // hosts can ONLY disable; only admin can re-enable
  reason: z.string().min(5, 'Please provide a reason of at least 5 characters'),
})

/**
 * POST /api/host/listings/[id]/kill-switch
 *
 * Host-initiated kill switch — DISABLE only.
 * Re-enabling requires an admin (enforced here and at the DB layer).
 *
 * Security execution order (must not be re-ordered):
 *   1. Verify host JWT + approved status
 *   2. Verify vehicle ownership
 *   3. Verify there is an active booking for this vehicle
 *   4. Verify Bouncie device is registered
 *   5. Insert kill_switch_logs BEFORE calling Bouncie (audit-first pattern)
 *   6. Call Bouncie API
 *   7. Update kill_switch_logs with Bouncie response
 *   8. Update vehicles.kill_switch_enabled = true
 *   9. Notify renter via SMS
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ── Step 1: Auth ────────────────────────────────────────────────────────────
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = KillSwitchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Step 2: Ownership check ─────────────────────────────────────────────────
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, host_id, bouncie_device_id, plate_number, kill_switch_enabled')
    .eq('id', params.id)
    .single() as {
      data: {
        id: string
        host_id: string
        bouncie_device_id: string | null
        plate_number: string
        kill_switch_enabled: boolean
      } | null
    }

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  if (vehicle.host_id !== profile.id) {
    return NextResponse.json({ error: 'You do not own this vehicle' }, { status: 403 })
  }

  // ── Step 3: Active booking check ────────────────────────────────────────────
  const { data: activeBooking } = await supabase
    .from('bookings')
    .select('id, renter_id')
    .eq('vehicle_id', params.id)
    .in('status', ['confirmed', 'active'])
    .limit(1)
    .single() as { data: { id: string; renter_id: string } | null }

  if (!activeBooking) {
    return NextResponse.json(
      { error: 'Kill switch can only be used when the vehicle has an active booking.' },
      { status: 409 }
    )
  }

  // ── Step 4: Device check ────────────────────────────────────────────────────
  if (!vehicle.bouncie_device_id) {
    return NextResponse.json(
      { error: 'No Bouncie GPS device registered for this vehicle.' },
      { status: 422 }
    )
  }

  // ── Step 5: Insert audit log BEFORE calling Bouncie ─────────────────────────
  const { data: logEntry } = await supabase
    .from('kill_switch_logs')
    .insert({
      vehicle_id:      params.id,
      booking_id:      activeBooking.id,
      initiated_by:    profile.id,
      initiator_role:  'host',
      action:          'disable',
      reason:          parsed.data.reason,
      bouncie_response: null,
    })
    .select('id')
    .single()

  // ── Step 6: Call Bouncie ─────────────────────────────────────────────────────
  let bouncieResponse: Record<string, unknown> = {}
  try {
    await setIgnitionInterrupt(vehicle.bouncie_device_id, 'enable')  // 'enable' = interrupt active = disable ignition
    bouncieResponse = { success: true }
  } catch (err) {
    bouncieResponse = { success: false, error: String(err) }
    // Log the failure but do not leave the audit log without a response
    if (logEntry) {
      await supabase
        .from('kill_switch_logs')
        .update({ bouncie_response: bouncieResponse })
        .eq('id', logEntry.id)
    }
    return NextResponse.json(
      { error: 'Failed to communicate with the GPS device. Please try again or contact support.' },
      { status: 502 }
    )
  }

  // ── Step 7: Update audit log with Bouncie response ───────────────────────────
  if (logEntry) {
    await supabase
      .from('kill_switch_logs')
      .update({ bouncie_response: bouncieResponse })
      .eq('id', logEntry.id)
  }

  // ── Step 8: Update vehicle state ─────────────────────────────────────────────
  await supabase
    .from('vehicles')
    .update({ kill_switch_enabled: true })
    .eq('id', params.id)

  // ── Step 9: Notify renter ───────────────────────────────────────────────────
  const { data: renter } = await supabase
    .from('profiles')
    .select('phone, full_name')
    .eq('id', activeBooking.renter_id)
    .single()

  if (renter?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      renter.phone,
      `Easy Drive Notice: A remote ignition interrupt has been activated on your rental vehicle ${vehicle.plate_number} by the vehicle owner. Reason: ${parsed.data.reason}. The vehicle will not restart after the next shutoff. Contact Easy Drive support immediately.`
    ).catch(console.error)
  }

  return NextResponse.json({
    success: true,
    action:  'disable',
    plate:   vehicle.plate_number,
    message: 'Kill switch activated. Renter has been notified.',
  })
}
