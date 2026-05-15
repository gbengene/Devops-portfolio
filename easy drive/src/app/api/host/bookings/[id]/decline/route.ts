import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const DeclineSchema = z.object({
  reason: z.string().min(5).optional(),
})

/**
 * POST /api/host/bookings/[id]/decline
 *
 * Decline a pending booking request. The booking transitions to 'declined'.
 * The renter is notified via SMS.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = DeclineSchema.safeParse(body)
  const declineReason = parsed.success ? parsed.data.reason : undefined

  const supabase = createAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, host_id, renter_id, vehicle_id')
    .eq('id', params.id)
    .single() as {
      data: {
        id: string
        status: string
        host_id: string
        renter_id: string
        vehicle_id: string
      } | null
    }

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.host_id !== profile.id) {
    return NextResponse.json({ error: 'You do not own this booking' }, { status: 403 })
  }
  if (booking.status !== 'requested') {
    return NextResponse.json(
      { error: `Cannot decline a booking with status '${booking.status}'` },
      { status: 409 }
    )
  }

  await supabase
    .from('bookings')
    .update({
      status: 'declined',
      notes:  declineReason ? `Declined: ${declineReason}` : 'Declined by host',
    })
    .eq('id', booking.id)

  // Notify renter
  const { data: renter } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', booking.renter_id)
    .single()

  if (renter?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      renter.phone,
      `Easy Drive: Unfortunately your booking request was declined by the host.${declineReason ? ` Reason: ${declineReason}.` : ''} Browse other available vehicles at easydrive.ca`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, bookingId: booking.id, status: 'declined' })
}
