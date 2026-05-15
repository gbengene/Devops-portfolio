import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

/**
 * Return URL after Stripe Connect KYC.
 * We check the current stripe_connect_status to decide what to show.
 * The actual status update happens via the `account.updated` webhook — this page
 * shows a user-facing confirmation while we wait for the webhook to fire.
 */
export default async function StripeReturnPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_status')
    .eq('auth_user_id', user.id)
    .single()

  const isOnboarded = profile?.stripe_connect_status === 'onboarded'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full p-8 text-center">
        {isOnboarded ? (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payout account connected!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your Stripe account is set up. You will receive 80% of each booking directly to your bank.
            </p>
            <Link href="/host" className="btn-primary w-full justify-center" style={{ minHeight: 48 }}>
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verification in progress</h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Stripe is reviewing your information. This usually takes a few minutes.
              We will notify you by email once your payout account is active.
            </p>
            <Link href="/host" className="btn-secondary w-full justify-center" style={{ minHeight: 48 }}>
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
