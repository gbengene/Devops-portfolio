import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/host/bookings/[id]
 * Fetch a single booking for the host booking detail page.
 * Host must own the vehicle in the booking.
 */
export async function GET(
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
    .select(`
      id, status, start_date, end_date, weekly_rate_cad,
      platform_fee_cad, deposit_cad, notes,
      vehicles!vehicle_id (make, model, year, plate_number),
      renter:profiles!renter_id (
        full_name, phone, email,
        avg_rating_as_renter, rentals_completed_as_renter
      )
    `)
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single() as { data: any }

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  return NextResponse.json(booking)
}
