import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient, createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PatchListingSchema = z.object({
  weekly_rate_cad:       z.number().int().min(200).max(2000).optional(),
  auto_accept_bookings:  z.boolean().optional(),
  bouncie_device_id:     z.string().optional(),
  passtime_device_id:    z.string().optional(),
  listing_status:        z.enum(['active', 'paused', 'delisted']).optional(),
  trim:                  z.string().optional(),
  notes:                 z.string().optional(),
})

/**
 * GET /api/host/listings/[id]
 * Fetch a single vehicle. Host must own it.
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

  const supabase = createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, plate_number, colour, listing_status,
      weekly_rate_cad, city, auto_accept_bookings, rejection_reason,
      bouncie_device_id, passtime_device_id, insurance_cert_url,
      insurance_cert_expires, insurance_covers_delivery, avg_rating
    `)
    .eq('id', params.id)
    .eq('host_id', profile.id)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  return NextResponse.json(vehicle)
}

/**
 * PATCH /api/host/listings/[id]
 * Update an editable vehicle. Hosts can only update their own vehicles.
 * Certain status transitions are restricted (e.g. cannot unilaterally set 'active').
 */
export async function PATCH(
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
  const parsed = PatchListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Ownership check
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, listing_status, host_id')
    .eq('id', params.id)
    .single() as { data: { id: string; listing_status: string; host_id: string } | null }

  if (!vehicle || vehicle.host_id !== profile.id) {
    return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 })
  }

  // Guard: hosts cannot self-promote to 'approved' or 'active' after review rejection
  // They can only set paused/delisted or resume from paused->active
  if (parsed.data.listing_status === 'active' && vehicle.listing_status !== 'paused') {
    return NextResponse.json(
      { error: "Listings can only be resumed from 'paused' status" },
      { status: 422 }
    )
  }

  const updatePayload: Record<string, unknown> = {}
  if (parsed.data.weekly_rate_cad !== undefined)      updatePayload.weekly_rate_cad      = parsed.data.weekly_rate_cad
  if (parsed.data.auto_accept_bookings !== undefined)  updatePayload.auto_accept_bookings  = parsed.data.auto_accept_bookings
  if (parsed.data.bouncie_device_id !== undefined)     updatePayload.bouncie_device_id     = parsed.data.bouncie_device_id
  if (parsed.data.passtime_device_id !== undefined)    updatePayload.passtime_device_id    = parsed.data.passtime_device_id
  if (parsed.data.listing_status !== undefined)        updatePayload.listing_status        = parsed.data.listing_status
  if (parsed.data.trim !== undefined)                  updatePayload.trim                  = parsed.data.trim
  if (parsed.data.notes !== undefined)                 updatePayload.notes                 = parsed.data.notes

  const { error } = await supabase
    .from('vehicles')
    .update(updatePayload)
    .eq('id', params.id)

  if (error) {
    console.error('Vehicle update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
