import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/listings/[id]/approve
 * Approve a vehicle listing.
 * Transitions listing_status to 'active' and marks the listing_application as approved.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: Awaited<ReturnType<typeof requireAdminSession>>

  try {
    session = await requireAdminSession()
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch admin profile for audit trail
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, listing_status, host_id')
    .eq('id', params.id)
    .single() as { data: { id: string; listing_status: string; host_id: string } | null }

  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  if (vehicle.listing_status !== 'pending_review') {
    return NextResponse.json(
      { error: `Cannot approve a listing with status '${vehicle.listing_status}'` },
      { status: 409 }
    )
  }

  // Validate host has completed Stripe Connect (required to receive payouts)
  const { data: host } = await supabase
    .from('profiles')
    .select('stripe_connect_status')
    .eq('id', vehicle.host_id)
    .single()

  if (host?.stripe_connect_status !== 'onboarded') {
    return NextResponse.json(
      { error: 'Host has not completed Stripe Connect onboarding. Cannot approve listing until payouts are configured.' },
      { status: 422 }
    )
  }

  await supabase
    .from('vehicles')
    .update({ listing_status: 'active', rejection_reason: null })
    .eq('id', params.id)

  // Update the pending listing_application
  await supabase
    .from('listing_applications')
    .update({
      status:      'approved',
      reviewed_by: adminProfile?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('vehicle_id', params.id)
    .eq('status', 'pending')

  // Notify host
  const { data: host2 } = await supabase
    .from('profiles')
    .select('phone, full_name')
    .eq('id', vehicle.host_id)
    .single()

  if (host2?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      host2.phone,
      `Easy Drive: Congratulations, ${host2.full_name}! Your vehicle listing has been approved and is now live on the marketplace. Log in to manage availability.`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, vehicleId: params.id, status: 'active' })
}
