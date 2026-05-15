import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, CreditCard, FileText, Phone, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RenterPortal() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/apply')

  // Active rental
  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      id, status, weekly_rate_cad, deposit_cad, start_date,
      vehicles!vehicle_id(make, model, year, plate_number, colour),
      stripe_subscription_id
    `)
    .eq('renter_id', profile.id)
    .in('status', ['active', 'pending_payment', 'pending_signature'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: any }

  // Recent payments
  const { data: payments } = await supabase
    .from('payments')
    .select('id, type, amount_cad, status, paid_at, created_at')
    .eq('rental_id', rental?.id ?? '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false })
    .limit(5)

  // Most recent application if no active rental
  const { data: application } = !rental ? await supabase
    .from('applications')
    .select('id, status, submitted_at')
    .eq('applicant_id', profile.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle() : { data: null }

  const firstName = profile.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-navy">Easy<span className="text-primary">Drive</span></span>
          <form action="/api/auth/signout" method="POST">
            <button className="text-xs text-gray-400 hover:text-gray-700">Sign out</button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-24">

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hi {firstName} 👋</h1>
          <p className="text-sm text-gray-500">Your Easy Drive dashboard</p>
        </div>

        {/* ── No rental: application status ── */}
        {!rental && application && (
          <ApplicationStatusCard status={application.status} submittedAt={application.submitted_at} />
        )}

        {/* ── No rental or application ── */}
        {!rental && !application && (
          <div className="card text-center py-10">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700 mb-1">No active rental</p>
            <p className="text-sm text-gray-400 mb-5">Apply to get behind the wheel today</p>
            <Link href="/apply" className="btn-primary" style={{ minWidth: 'auto' }}>Apply Now</Link>
          </div>
        )}

        {/* ── Active / Pending rental ── */}
        {rental && (
          <>
            {/* Vehicle card */}
            <div className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Your Vehicle</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    {rental.vehicles.year} {rental.vehicles.make} {rental.vehicles.model}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">{rental.vehicles.colour}</p>
                </div>
                <StatusBadge status={rental.status} />
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="font-plate text-sm font-medium text-gray-800">
                  {rental.vehicles.plate_number}
                </span>
              </div>
              {rental.start_date && (
                <p className="text-xs text-gray-400 mt-2">
                  Rental started: {new Date(rental.start_date).toLocaleDateString('en-CA', { dateStyle: 'long' })}
                </p>
              )}
            </div>

            {/* Action banners based on status */}
            {rental.status === 'pending_payment' && (
              <div className="alert-warning">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Complete your payment setup</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Your application is approved. Please add your payment method to activate your rental.
                    </p>
                    <Link href={`/portal/payment-setup?rental=${rental.id}`}
                      className="inline-block mt-3 btn-primary text-sm" style={{ minWidth: 'auto', minHeight: 40 }}>
                      Set up payment →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {rental.status === 'pending_signature' && (
              <div className="alert-info">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-navy)' }}>
                      Sign your rental agreement
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Check your email or SMS for your signing link, or tap below to re-send it.
                    </p>
                    <button className="inline-block mt-3 btn-secondary text-sm" style={{ minWidth: 'auto', minHeight: 40 }}>
                      Re-send signing link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Next payment */}
            {rental.status === 'active' && (
              <NextPaymentCard weeklyRate={rental.weekly_rate_cad} />
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FileText, label: 'Agreement',  href: `/portal/documents?rental=${rental.id}` },
                { icon: CreditCard, label: 'Payments', href: `/portal/payments?rental=${rental.id}` },
                { icon: Phone,      label: 'Contact',  href: 'https://wa.me/1XXXXXXXXXX' },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href}
                  className="card-hover flex flex-col items-center gap-2 py-4 text-center">
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>

            {/* Recent payments */}
            {payments && payments.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Payments</h3>
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.status === 'paid'
                          ? <CheckCircle className="w-4 h-4 text-green-500" />
                          : <Clock className="w-4 h-4 text-amber-500" />
                        }
                        <span className="text-sm text-gray-700 capitalize">
                          {p.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">${p.amount_cad}</span>
                        {p.paid_at && (
                          <p className="text-xs text-gray-400">
                            {new Date(p.paid_at).toLocaleDateString('en-CA')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders */}
            <div className="card bg-gray-50 border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Important Reminders
              </h3>
              <ul className="space-y-2">
                {[
                  'Vehicle must stay within Ontario at all times',
                  'Report any accident immediately — call us before moving the car',
                  'Give 72 hours notice to end your rental',
                  'Return the car clean to receive your full deposit',
                ].map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-300 mt-0.5 flex-shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:             'badge-active',
    pending_payment:    'badge-pending',
    pending_signature:  'badge-pending',
    ended:              'badge-terminated',
    terminated:         'badge-terminated',
  }
  const labels: Record<string, string> = {
    active:             'Active',
    pending_payment:    'Setup Required',
    pending_signature:  'Awaiting Signature',
    ended:              'Ended',
    terminated:         'Terminated',
  }
  return <span className={map[status] ?? 'badge'}>{labels[status] ?? status}</span>
}

function NextPaymentCard({ weeklyRate }: { weeklyRate: number }) {
  // Calculate next Monday from today (weekly billing anchor)
  const today = new Date()
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7
  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysUntilMonday)
  const daysLeft = daysUntilMonday

  return (
    <div className={`card ${daysLeft <= 1 ? 'border-amber-300 bg-amber-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Next Payment</p>
          <p className="text-2xl font-bold text-gray-900">${weeklyRate}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Due {daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}
            {' · '}
            {nextDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <Link href="/portal/payments"
          className="btn-secondary text-sm"
          style={{ minWidth: 'auto', minHeight: 40, padding: '0 16px' }}>
          Manage card
        </Link>
      </div>
    </div>
  )
}

function ApplicationStatusCard({ status, submittedAt }: { status: string; submittedAt: string }) {
  const steps = [
    { key: 'submitted', label: 'Application submitted' },
    { key: 'review',    label: 'Under review (within 24h)' },
    { key: 'decision',  label: 'Awaiting your decision' },
    { key: 'pickup',    label: 'Vehicle pickup' },
  ]
  const activeStep = status === 'pending' ? 1 : status === 'approved' ? 2 : 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Application Status</h2>
        <span className="badge-pending">Under Review</span>
      </div>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              i < activeStep  ? 'bg-green-500 text-white' :
              i === activeStep ? 'bg-primary text-white' :
              'bg-gray-100 text-gray-400'
            }`} style={{ background: i === activeStep ? 'var(--color-primary)' : undefined }}>
              {i < activeStep ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i <= activeStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Submitted {new Date(submittedAt).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
      </p>
    </div>
  )
}
