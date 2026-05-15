import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface Payout {
  id: string
  amount_cad: number
  status: string
  period_start: string | null
  period_end: string | null
  arrival_date: string | null
  created_at: string
}

const PAYOUT_BADGE: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-amber-100 text-amber-700' },
  in_transit: { label: 'In transit', className: 'bg-blue-100 text-blue-700'   },
  paid:       { label: 'Paid',       className: 'bg-green-100 text-green-700' },
  failed:     { label: 'Failed',     className: 'bg-red-100 text-red-600'     },
}

export default async function EarningsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, avg_rating_as_host, rentals_completed_as_host')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: payouts } = await supabase
    .from('payouts')
    .select('id, amount_cad, status, period_start, period_end, arrival_date, created_at')
    .eq('host_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalPaid = payouts?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_cad, 0) ?? 0
  const inTransit = payouts?.filter(p => p.status === 'in_transit').reduce((s, p) => s + p.amount_cad, 0) ?? 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total paid out" value={`$${totalPaid.toLocaleString()}`} />
        <SummaryCard label="In transit" value={`$${inTransit.toLocaleString()}`} colour="text-blue-600" />
        <SummaryCard label="Rentals completed" value={String(profile.rentals_completed_as_host ?? 0)} />
        <SummaryCard
          label="Host rating"
          value={profile.avg_rating_as_host ? `${profile.avg_rating_as_host} ★` : 'N/A'}
          colour="text-amber-600"
        />
      </div>

      {/* Payout history */}
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Payout history</h2>
      {!payouts || payouts.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-500">
          No payouts yet. Payouts are issued weekly after bookings complete.
        </div>
      ) : (
        <div className="space-y-2">
          {payouts.map(p => {
            const badge = PAYOUT_BADGE[p.status] ?? { label: p.status, className: 'bg-gray-100 text-gray-600' }
            return (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">${p.amount_cad.toLocaleString()} CAD</p>
                  <p className="text-xs text-gray-500">
                    {p.period_start && p.period_end
                      ? `${p.period_start} – ${p.period_end}`
                      : new Date(p.created_at).toLocaleDateString('en-CA')}
                  </p>
                  {p.arrival_date && (
                    <p className="text-xs text-gray-400">Arrives {p.arrival_date}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, colour = 'text-gray-900' }: {
  label: string
  value: string
  colour?: string
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${colour}`}>{value}</p>
    </div>
  )
}
