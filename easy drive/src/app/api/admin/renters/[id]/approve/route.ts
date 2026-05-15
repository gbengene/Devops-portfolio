import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/renters/[id]/approve
 * Approve a renter's application.
 * [id] is the renter's profile ID.
 *
 * Sets profiles.renter_status = 'approved' and updates renter_applications.
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

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  // Verify renter exists and is actually a renter
  const { data: renter } = await supabase
    .from('profiles')
    .select('id, role, renter_status, full_name, phone')
    .eq('id', params.id)
    .single()

  if (!renter) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (renter.role !== 'renter') {
    return NextResponse.json({ error: 'Profile is not a renter' }, { status: 422 })
  }

  await supabase
    .from('profiles')
    .update({ renter_status: 'approved' })
    .eq('id', params.id)

  await supabase
    .from('renter_applications')
    .update({
      status:      'approved',
      reviewed_by: adminProfile?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('renter_id', params.id)
    .eq('status', 'pending')

  if (renter.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      renter.phone,
      `Easy Drive: Great news, ${renter.full_name}! Your renter account has been approved. Log in to browse available vehicles and book your first car.`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, renterId: params.id, status: 'approved' })
}
