import Link from 'next/link'

interface ActiveRental {
  id: string
  weekly_rate_cad: number
  profiles: { full_name: string } | null
  vehicles: { plate_number: string } | null
}

export function FleetSummary({ rentals }: { rentals: ActiveRental[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Active Rentals</h2>
        <Link href="/admin/fleet" className="text-xs text-teal-600 hover:underline">
          View fleet →
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {rentals.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No active rentals</p>
        )}
        {rentals.map(rental => (
          <Link
            key={rental.id}
            href={`/admin/rentals/${rental.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {rental.profiles?.full_name ?? '—'}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {rental.vehicles?.plate_number ?? '—'}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              ${rental.weekly_rate_cad}/wk
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
