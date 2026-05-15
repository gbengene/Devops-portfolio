import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RejectSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required'),
})

/**
 * POST /api/admin/renters/[id]/reject
 * Reject a renter's application with a reason.
 * [id] is the renter's profile ID.
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

  const { data: renter } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone')
    .eq('id', params.id)
    .single()

  if (!renter) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (renter.role !== 'renter') {
    return NextResponse.json({ error: 'Profile is not a renter' }, { status: 422 })
  }

  await supabase
    .from('profiles')
    .update({ renter_status: 'rejected' })
    .eq('id', params.id)

  await supabase
    .from('renter_applications')
    .update({
      status:           'rejected',
      rejection_reason: parsed.data.reason,
      reviewed_by:      adminProfile?.id,
      reviewed_at:      new Date().toISOString(),
    })
    .eq('renter_id', params.id)
    .eq('status', 'pending')

  if (renter.phone) {
    const { sendSMS } = await import('@/lib/notifications')
    await sendSMS(
      renter.phone,
      `Easy Drive: Unfortunately, your renter application was not approved at this time. Reason: ${parsed.data.reason}. Contact support if you have questions.`
    ).catch(console.error)
  }

  return NextResponse.json({ success: true, renterId: params.id, status: 'rejected' })
}
