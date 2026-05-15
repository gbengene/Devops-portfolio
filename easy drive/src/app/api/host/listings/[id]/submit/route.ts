import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'

const MIN_PHOTOS = 8

/**
 * POST /api/host/listings/[id]/submit
 *
 * Submit a vehicle listing for admin review.
 * Validates eligibility:
 *   1. Host owns the vehicle
 *   2. At least 8 photos uploaded
 *   3. Insurance certificate present
 *   4. Bouncie GPS device ID present
 *   5. Weekly rate set
 *
 * On success, transitions listing_status from 'draft' to 'pending_review'
 * and creates a listing_applications record.
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

  // Ownership + vehicle state
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select(`
      id, host_id, listing_status, insurance_cert_url,
      bouncie_device_id, weekly_rate_cad
    `)
    .eq('id', params.id)
    .single() as {
      data: {
        id: string
        host_id: string
        listing_status: string
        insurance_cert_url: string | null
        bouncie_device_id: string | null
        weekly_rate_cad: number | null
      } | null
    }

  if (!vehicle || vehicle.host_id !== profile.id) {
    return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 })
  }

  if (!['draft', 'rejected'].includes(vehicle.listing_status)) {
    return NextResponse.json(
      { error: `Cannot submit a listing with status '${vehicle.listing_status}'` },
      { status: 422 }
    )
  }

  // ── Eligibility checks ──────────────────────────────────────────────────────

  // 1. Photo count
  const { count: photoCount } = await supabase
    .from('listing_photos')
    .select('id', { count: 'exact', head: true })
    .eq('vehicle_id', params.id)

  if ((photoCount ?? 0) < MIN_PHOTOS) {
    return NextResponse.json(
      { error: `At least ${MIN_PHOTOS} photos are required (${photoCount ?? 0} uploaded so far).` },
      { status: 422 }
    )
  }

  // 2. Insurance
  if (!vehicle.insurance_cert_url) {
    return NextResponse.json(
      { error: 'Insurance certificate is required before submission.' },
      { status: 422 }
    )
  }

  // 3. GPS device
  if (!vehicle.bouncie_device_id) {
    return NextResponse.json(
      { error: 'Bouncie GPS device ID is required before submission.' },
      { status: 422 }
    )
  }

  // 4. Rate
  if (!vehicle.weekly_rate_cad) {
    return NextResponse.json(
      { error: 'Weekly rate must be set before submission.' },
      { status: 422 }
    )
  }

  // ── Transition ──────────────────────────────────────────────────────────────

  await supabase
    .from('vehicles')
    .update({ listing_status: 'pending_review', rejection_reason: null })
    .eq('id', params.id)

  await supabase
    .from('listing_applications')
    .insert({
      vehicle_id:   params.id,
      host_id:      profile.id,
      status:       'pending',
      submitted_at: new Date().toISOString(),
    })

  return NextResponse.json({ success: true, message: 'Listing submitted for review.' })
}
