import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdminSession } from '@/lib/supabase/server'

/**
 * POST /api/alerts/[id]/acknowledge
 * Admin only — marks an alert as acknowledged, removing it from the live feed.
 * Called by the AlertFeed component dismiss button.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession().catch(() => null)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  const { error } = await supabase
    .from('alerts')
    .update({
      acknowledged:    true,
      acknowledged_by: adminProfile?.id ?? null,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ acknowledged: true })
}
