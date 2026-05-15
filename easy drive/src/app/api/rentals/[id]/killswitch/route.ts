import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdminSession } from '@/lib/supabase/server'
import { setIgnitionInterrupt } from '@/lib/bouncie'
import { z } from 'zod'

const KillSwitchSchema = z.object({
  action: z.enum(['enable', 'disable']),
  reason: z.string().min(5),     // admin must state a reason — creates audit trail
})

/**
 * POST /api/rentals/[id]/killswitch
 * Admin only — enable or disable the ignition interrupt on a rental's vehicle.
 *
 * Security controls:
 *  1. Admin JWT verified by requireAdminSession()
 *  2. Rental must be active (cannot kill a returned vehicle)
 *  3. Every action is written to the alerts table (full audit trail)
 *  4. Renter SMS is sent on enable (transparency + legal compliance)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession()
  const body = await req.json()
  const parsed = KillSwitchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch rental + vehicle + renter
  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      id, status, vehicle_id,
      vehicles!vehicle_id (plate_number, bouncie_device_id, passtime_device_id),
      profiles!renter_id (full_name, phone)
    `)
    .eq('id', params.id)
    .single() as { data: any }

  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
  if (rental.status !== 'active') {
    return NextResponse.json({ error: 'Kill switch can only be used on active rentals' }, { status: 409 })
  }
  if (!rental.vehicles?.bouncie_device_id) {
    return NextResponse.json({ error: 'No GPS device registered for this vehicle' }, { status: 422 })
  }

  // Get admin profile for audit log
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .single()

  // Call Bouncie API to set ignition interrupt
  await setIgnitionInterrupt(rental.vehicles.bouncie_device_id, parsed.data.action)

  // Update vehicle kill switch state
  await supabase
    .from('vehicles')
    .update({ kill_switch_enabled: parsed.data.action === 'enable' })
    .eq('id', rental.vehicle_id)

  // Audit log to alerts table
  await supabase.from('alerts').insert({
    vehicle_id:     rental.vehicle_id,
    rental_id:      rental.id,
    type:           parsed.data.action === 'enable' ? 'kill_switch_activated' : 'kill_switch_deactivated',
    severity:       parsed.data.action === 'enable' ? 'critical' : 'info',
    message:        `Kill switch ${parsed.data.action}d for vehicle ${rental.vehicles.plate_number}. Reason: ${parsed.data.reason}`,
    metadata:       { acted_by: adminProfile?.id, reason: parsed.data.reason },
    acknowledged:   true,   // admin action is self-acknowledged
    acknowledged_by: adminProfile?.id,
    acknowledged_at: new Date().toISOString(),
  })

  // Notify renter if kill switch enabled (required by contract + Ontario law)
  if (parsed.data.action === 'enable' && rental.profiles?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      rental.profiles.phone,
      `Easy Drive Notice: A remote ignition interrupt has been activated on your rental vehicle ${rental.vehicles.plate_number} due to: ${parsed.data.reason}. The vehicle will not restart after the next shutoff. Contact us immediately to resolve.`
    ).catch(console.error)
  }

  return NextResponse.json({
    success: true,
    action: parsed.data.action,
    plate: rental.vehicles.plate_number,
  })
}
