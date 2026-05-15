import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { createDashboardLink } from '@/lib/stripe/connect'

/**
 * POST /api/host/stripe-connect/dashboard
 *
 * Returns an Express Dashboard login link so the host can view their payouts.
 * Only works if the account has completed onboarding.
 *
 * Security: requireApprovedHost() must pass before any Stripe call.
 */
export async function POST(req: NextRequest) {
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, stripe_connect_status')
    .eq('id', profile.id)
    .single()

  if (!fullProfile?.stripe_connect_account_id) {
    return NextResponse.json(
      { error: 'Stripe Connect account not set up yet. Please complete onboarding first.' },
      { status: 422 }
    )
  }

  if (fullProfile.stripe_connect_status !== 'onboarded') {
    return NextResponse.json(
      { error: 'Stripe Connect account is not fully onboarded yet.' },
      { status: 422 }
    )
  }

  const dashboardUrl = await createDashboardLink(fullProfile.stripe_connect_account_id)
  return NextResponse.json({ url: dashboardUrl })
}
