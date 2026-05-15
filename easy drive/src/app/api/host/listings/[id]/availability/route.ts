import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const BlockSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  end_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  reason:     z.enum(['personal', 'maintenance', 'blocked']).optional(),
})

const DeleteSchema = z.object({
  block_id: z.string().uuid(),
})

/**
 * GET /api/host/listings/[id]/availability
 * Return all non-booking availability blocks for this vehicle.
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

  // Ownership check
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 })

  const { data: blocks } = await supabase
    .from('availability_blocks')
    .select('id, start_date, end_date, reason')
    .eq('vehicle_id', params.id)
    .order('start_date', { ascending: true })

  return NextResponse.json(blocks ?? [])
}

/**
 * POST /api/host/listings/[id]/availability
 * Block a date range for this vehicle.
 * The GiST exclusion constraint on the DB prevents overlapping bookings.
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

  const body = await req.json()
  const parsed = BlockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.start_date >= parsed.data.end_date) {
    return NextResponse.json({ error: 'start_date must be before end_date' }, { status: 422 })
  }

  const supabase = createAdminClient()

  // Ownership check
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 })

  const { data: block, error } = await supabase
    .from('availability_blocks')
    .insert({
      vehicle_id:  params.id,
      start_date:  parsed.data.start_date,
      end_date:    parsed.data.end_date,
      reason:      parsed.data.reason ?? 'blocked',
    })
    .select('id, start_date, end_date, reason')
    .single()

  if (error) {
    // The GiST exclusion constraint fires with a specific error code
    if (error.code === '23P01') {
      return NextResponse.json(
        { error: 'These dates overlap with an existing booking or block.' },
        { status: 409 }
      )
    }
    console.error('Availability block error:', error)
    return NextResponse.json({ error: 'Failed to block dates' }, { status: 500 })
  }

  return NextResponse.json(block, { status: 201 })
}

/**
 * DELETE /api/host/listings/[id]/availability
 * Remove a manually-created availability block.
 * Booking-generated blocks cannot be deleted this way.
 */
export async function DELETE(
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

  const body = await req.json()
  const parsed = DeleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'block_id is required' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch block and verify it belongs to this vehicle (which this host owns)
  const { data: block } = await supabase
    .from('availability_blocks')
    .select('id, booking_id, vehicle_id')
    .eq('id', parsed.data.block_id)
    .eq('vehicle_id', params.id)
    .single() as { data: { id: string; booking_id: string | null; vehicle_id: string } | null }

  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  // Do not allow deleting booking-generated blocks through this endpoint
  if (block.booking_id) {
    return NextResponse.json(
      { error: 'Booking-generated blocks must be removed by cancelling the booking.' },
      { status: 422 }
    )
  }

  // Verify vehicle ownership
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  await supabase.from('availability_blocks').delete().eq('id', block.id)

  return NextResponse.json({ success: true })
}
