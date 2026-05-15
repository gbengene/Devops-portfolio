import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  requested:  { label: 'Pending',    className: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmed',  className: 'bg-blue-100 text-blue-700'   },
  active:     { label: 'Active',     className: 'bg-green-100 text-green-700' },
  declined:   { label: 'Declined',   className: 'bg-red-100 text-red-600'     },
  completed:  { label: 'Completed',  className: 'bg-gray-100 text-gray-600'   },
  cancelled:  { label: 'Cancelled',  className: 'bg-gray-100 text-gray-500'   },
  disputed:   { label: 'Disputed',   className: 'bg-red-100 text-red-700'     },
}

export default async function HostBookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, start_date, end_date, weekly_rate_cad, created_at,
      vehicles!vehicle_id (make, model, year, plate_number),
      renter:profiles!renter_id (full_name, phone)
    `)
    .eq('host_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50) as { data: any[] | null }

  const pending   = bookings?.filter(b => b.status === 'requested') ?? []
  const active    = bookings?.filter(b => ['confirmed', 'active'].includes(b.status)) ?? []
  const historical = bookings?.filter(b => ['completed', 'cancelled', 'declined', 'disputed'].includes(b.status)) ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {pending.length > 0 && (
        <Section title={`Pending requests (${pending.length})`}>
          {pending.map(b => <BookingRow key={b.id} booking={b} />)}
        </Section>
      )}

      <Section title="Active bookings">
        {active.length === 0
          ? <p className="text-sm text-gray-500">No active bookings.</p>
          : active.map(b => <BookingRow key={b.id} booking={b} />)
        }
      </Section>

      <Section title="Past bookings">
        {historical.length === 0
          ? <p className="text-sm text-gray-500">No past bookings yet.</p>
          : historical.map(b => <BookingRow key={b.id} booking={b} />)
        }
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function BookingRow({ booking }: { booking: any }) {
  const badge = STATUS_BADGE[booking.status] ?? { label: booking.status, className: 'bg-gray-100 text-gray-600' }
  return (
    <Link
      href={`/host/bookings/${booking.id}`}
      className="card p-4 flex items-center justify-between hover:border-primary transition-colors block"
    >
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {booking.vehicles?.year} {booking.vehicles?.make} {booking.vehicles?.model} — {booking.vehicles?.plate_number}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Renter: {booking.renter?.full_name}
          {booking.start_date && ` · From ${booking.start_date}`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-900">${booking.weekly_rate_cad}/wk</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>
    </Link>
  )
}
