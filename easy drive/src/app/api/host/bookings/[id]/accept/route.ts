import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/host/bookings/[id]/accept
 *
 * Accept a pending booking request. The booking must be in 'requested' status
 * and the host must own the vehicle.
 *
 * On acceptance, we also create an availability_block so the vehicle's calendar
 * reflects the booking and prevents double-booking via the GiST constraint.
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

  const supabase = createAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, host_id, vehicle_id, renter_id, start_date, end_date')
    .eq('id', params.id)
    .single() as {
      data: {
        id: string
        status: string
        host_id: string
        vehicle_id: string
        renter_id: string
        start_date: string
        end_date: string | null
      } | null
    }

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.host_id !== profile.id) {
    return NextResponse.json({ error: 'You do not own this booking' }, { status: 403 })
  }
  if (booking.status !== 'requested') {
    return NextResponse.json(
      { error: `Cannot accept a booking with status '${booking.status}'` },
      { status: 409 }
    )
  }

  // Transition booking to confirmed
  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', booking.id)

  // Block the dates in the availability calendar so the GiST constraint
  // prevents any subsequent overlapping booking from being created.
  if (booking.end_date) {
    await supabase
      .from('availability_blocks')
      .insert({
        vehicle_id:  booking.vehicle_id,
        start_date:  booking.start_date,
        end_date:    booking.end_date,
        reason:      'booked',
        booking_id:  booking.id,
      })
      .then(({ error }) => {
        // GiST conflict means the dates were already blocked — not an error at this point
        if (error && error.code !== '23P01') {
          console.error('Availability block insert error:', error)
        }
      })
  }

  // Notify renter
  const { data: renter } = await supabase
    .from('profiles')
    .select('phone, email, full_name')
    .eq('id', booking.renter_id)
    .single()

  if (renter?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      renter.phone,
      `Easy Drive: Your booking has been accepted! Starting ${booking.start_date}. Log in to complete payment and sign your agreement.`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, bookingId: booking.id, status: 'confirmed' })
}
