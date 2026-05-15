import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, CalendarDays, DollarSign, AlertCircle } from 'lucide-react'

export default async function HostDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, stripe_connect_status')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Earnings last 30 days — sum from payouts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount_cad')
    .eq('host_id', profile.id)
    .eq('status', 'paid')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const earningsLast30 = payouts?.reduce((sum, p) => sum + p.amount_cad, 0) ?? 0

  // Active booking count
  const { count: activeBookingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('host_id', profile.id)
    .eq('status', 'active')

  // Pending booking requests
  const { count: pendingBookingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('host_id', profile.id)
    .eq('status', 'requested')

  // Unacknowledged alerts for host
  const { count: alertCount } = await supabase
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('host_id', profile.id)
    .eq('acknowledged', false)

  const stripeNotOnboarded = profile.stripe_connect_status !== 'onboarded'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile.full_name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Host Dashboard</p>
      </div>

      {/* Stripe Connect banner */}
      {stripeNotOnboarded && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Complete your payout setup to start earning
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Connect your bank account via Stripe to receive rental payments.
            </p>
          </div>
          <Link
            href="/host/onboarding"
            className="btn-primary text-sm px-4 whitespace-nowrap"
            style={{ minWidth: 'auto', minHeight: 36 }}
          >
            Set up payouts
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Earnings (30 days)"
          value={`$${earningsLast30.toLocaleString()}`}
          colour="text-green-600"
        />
        <StatCard
          icon={<Car className="w-5 h-5" />}
          label="Active bookings"
          value={String(activeBookingCount ?? 0)}
          colour="text-blue-600"
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="Pending requests"
          value={String(pendingBookingCount ?? 0)}
          colour="text-amber-600"
          linkHref="/host/bookings"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Open alerts"
          value={String(alertCount ?? 0)}
          colour="text-red-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <QuickLink href="/host/listings/new" title="List a new vehicle" desc="Add a car and submit it for review." />
        <QuickLink href="/host/listings"     title="Manage my listings" desc="Edit, pause, or delist your vehicles." />
        <QuickLink href="/host/bookings"     title="View booking requests" desc="Accept or decline incoming bookings." />
        <QuickLink href="/host/earnings"     title="Payout history" desc="View weekly earnings and bank transfers." />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  colour,
  linkHref,
}: {
  icon: React.ReactNode
  label: string
  value: string
  colour: string
  linkHref?: string
}) {
  const inner = (
    <div className="card p-4 flex items-start gap-3">
      <div className={`mt-0.5 ${colour}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-xl font-bold ${colour}`}>{value}</p>
      </div>
    </div>
  )
  return linkHref ? <Link href={linkHref}>{inner}</Link> : <div>{inner}</div>
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card p-4 hover:border-primary transition-colors block">
      <p className="font-medium text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </Link>
  )
}
