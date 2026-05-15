import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, FileText, Phone, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RenterPortal() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, renter_status')
    .eq('auth_user_id', user.id)
    .single() as { data: any }

  if (!profile) redirect('/apply')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, status, start_date, weekly_rate_cad, deposit_cad,
      vehicles!vehicle_id(make, model, year, plate_number, colour)
    `)
    .eq('renter_id', profile.id as string)
    .in('status', ['active', 'confirmed', 'requested'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: any }

  let application: { id: string; status: string; submitted_at: string } | null = null
  if (!booking) {
    const { data: appData } = await supabase
      .from('renter_applications')
      .select('id, status, submitted_at')
      .eq('renter_id', profile.id as string)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: any }
    application = appData ?? null
  }

  const firstName = (profile.full_name as string | null)?.split(' ')[0] ?? 'there'

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
          <h1 className="text-xl font-bold text-gray-900">Hi {firstName}</h1>
          <p className="text-sm text-gray-500">Your Easy Drive dashboard</p>
        </div>

        {/* No booking: application status */}
        {!booking && application && (
          <ApplicationStatusCard status={application.status} submittedAt={application.submitted_at} />
        )}

        {/* No booking or application */}
        {!booking && !application && (
          <div className="card text-center py-10">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700 mb-1">No active booking</p>
            <p className="text-sm text-gray-400 mb-5">Browse available cars and request one today</p>
            <Link href="/browse" className="btn-primary" style={{ minWidth: 'auto' }}>Browse cars</Link>
          </div>
        )}

        {/* Active / Confirmed / Requested booking */}
        {booking && (
          <>
            <div className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Your Vehicle</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    {booking.vehicles.year} {booking.vehicles.make} {booking.vehicles.model}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">{booking.vehicles.colour}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="font-plate text-sm font-medium text-gray-800">
                  {booking.vehicles.plate_number ?? 'TBD'}
                </span>
              </div>
              {booking.start_date && (
                <p className="text-xs text-gray-400 mt-2">
                  Start date: {new Date(booking.start_date).toLocaleDateString('en-CA', { dateStyle: 'long' })}
                </p>
              )}
            </div>

            {booking.status === 'requested' && (
              <div className="alert-info">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-navy)' }}>
                      Booking request sent
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      The host will respond within 24 hours. No payment is required yet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="alert-info">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-navy)' }}>
                      Booking confirmed
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Your booking is confirmed. Contact the host to arrange pickup details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === 'active' && (
              <NextPaymentCard weeklyRate={booking.weekly_rate_cad} />
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FileText, label: 'Agreement',  href: `/portal/documents?booking=${booking.id}` },
                { icon: Clock,    label: 'History',    href: `/portal/history` },
                { icon: Phone,    label: 'Contact',    href: 'https://wa.me/1XXXXXXXXXX' },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href}
                  className="card-hover flex flex-col items-center gap-2 py-4 text-center">
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>

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
    requested:  'badge-pending',
    confirmed:  'badge-pending',
    active:     'badge-active',
    completed:  'badge-terminated',
    cancelled:  'badge-terminated',
    declined:   'badge-terminated',
  }
  const labels: Record<string, string> = {
    requested:  'Requested',
    confirmed:  'Confirmed',
    active:     'Active',
    completed:  'Completed',
    cancelled:  'Cancelled',
    declined:   'Declined',
  }
  return <span className={map[status] ?? 'badge'}>{labels[status] ?? status}</span>
}

function NextPaymentCard({ weeklyRate }: { weeklyRate: number }) {
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
