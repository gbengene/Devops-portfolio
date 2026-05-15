import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedHost, createAdminClient } from '@/lib/supabase/server'
import { createExpressAccount, createOnboardingLink } from '@/lib/stripe/connect'

/**
 * POST /api/host/stripe-connect/onboard
 *
 * Creates a Stripe Connect Express account for the host (if not already created)
 * and returns an onboarding link for KYC.
 *
 * Security: requireApprovedHost() must pass before any Stripe call.
 */
export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof requireApprovedHost>>['session']
  let profile: Awaited<ReturnType<typeof requireApprovedHost>>['profile']

  try {
    const result = await requireApprovedHost()
    session = result.session
    profile = result.profile
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch full profile (email, name, existing connect account)
  const { data: fullProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email, stripe_connect_account_id, stripe_connect_status')
    .eq('id', profile.id)
    .single()

  if (!fullProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  let connectAccountId = fullProfile.stripe_connect_account_id

  // Create a new Express account if one does not exist yet
  if (!connectAccountId) {
    connectAccountId = await createExpressAccount({
      email:         fullProfile.email,
      fullName:      fullProfile.full_name,
      hostProfileId: fullProfile.id,
    })

    await supabase
      .from('profiles')
      .update({
        stripe_connect_account_id: connectAccountId,
        stripe_connect_status:     'onboarding',
      })
      .eq('id', fullProfile.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const onboardingUrl = await createOnboardingLink({
    accountId:   connectAccountId,
    returnUrl:   `${appUrl}/host/onboarding/stripe-return`,
    refreshUrl:  `${appUrl}/host/onboarding`,
  })

  return NextResponse.json({ url: onboardingUrl })
}
