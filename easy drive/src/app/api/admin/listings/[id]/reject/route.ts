import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RejectSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed rejection reason (min 10 chars)'),
})

/**
 * POST /api/admin/listings/[id]/reject
 * Reject a vehicle listing with a required reason.
 * Transitions listing_status back to 'draft' so the host can correct and resubmit.
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

  const body = await req.json()
  const parsed = RejectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

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
      { error: `Cannot reject a listing with status '${vehicle.listing_status}'` },
      { status: 409 }
    )
  }

  // Return to 'draft' so the host can correct and resubmit
  await supabase
    .from('vehicles')
    .update({
      listing_status:   'draft',
      rejection_reason: parsed.data.reason,
    })
    .eq('id', params.id)

  await supabase
    .from('listing_applications')
    .update({
      status:      'rejected',
      admin_notes: parsed.data.reason,
      reviewed_by: adminProfile?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('vehicle_id', params.id)
    .eq('status', 'pending')

  // Notify host
  const { data: host } = await supabase
    .from('profiles')
    .select('phone, full_name')
    .eq('id', vehicle.host_id)
    .single()

  if (host?.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      host.phone,
      `Easy Drive: Your vehicle listing requires changes before it can go live. Reason: ${parsed.data.reason}. Log in to update and resubmit.`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, vehicleId: params.id, status: 'draft' })
}
