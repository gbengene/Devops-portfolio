import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedRenter, createAdminClient, createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const today = () => new Date().toISOString().split('T')[0] as string

const BookingSchema = z.object({
  vehicle_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be YYYY-MM-DD').refine(
    v => v >= today(),
    { message: 'start_date must be today or in the future' }
  ),
  notes: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  let profile: Awaited<ReturnType<typeof requireApprovedRenter>>['profile']

  try {
    const result = await requireApprovedRenter()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { vehicle_id, start_date, notes } = parsed.data

  const supabase = createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, host_id, weekly_rate_cad, listing_status')
    .eq('id', vehicle_id)
    .eq('listing_status', 'active')
    .single() as { data: any }

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found or not available' }, { status: 404 })
  }

  const adminClient = createAdminClient()

  const profileId = (profile as any).id as string

  const { data: existingBooking } = await adminClient
    .from('bookings')
    .select('id')
    .eq('renter_id', profileId)
    .eq('vehicle_id', vehicle_id)
    .in('status', ['requested', 'confirmed'])
    .maybeSingle() as { data: any }

  if (existingBooking) {
    return NextResponse.json(
      { error: 'You already have an active or pending booking for this vehicle' },
      { status: 409 }
    )
  }

  const platform_fee_cad = Math.round(vehicle.weekly_rate_cad * 0.20)

  const { data: inserted, error: insertError } = await adminClient
    .from('bookings')
    .insert({
      renter_id:        profileId,
      host_id:          vehicle.host_id,
      vehicle_id,
      status:           'requested',
      start_date,
      weekly_rate_cad:  vehicle.weekly_rate_cad,
      platform_fee_cad,
      deposit_cad:      500,
      notes:            notes ?? null,
    } as any)
    .select('id')
    .single() as { data: { id: string } | null; error: any }

  if (insertError || !inserted) {
    console.error('Booking insert error:', insertError)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  return NextResponse.json({ bookingId: inserted.id }, { status: 201 })
}
