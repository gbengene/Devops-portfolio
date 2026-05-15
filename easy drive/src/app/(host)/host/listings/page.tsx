import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Car } from 'lucide-react'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft:          { label: 'Draft',          className: 'bg-gray-100 text-gray-600'   },
  pending_review: { label: 'Under Review',   className: 'bg-amber-100 text-amber-700' },
  approved:       { label: 'Approved',       className: 'bg-blue-100 text-blue-700'   },
  active:         { label: 'Active',         className: 'bg-green-100 text-green-700' },
  paused:         { label: 'Paused',         className: 'bg-yellow-100 text-yellow-700'},
  delisted:       { label: 'Delisted',       className: 'bg-red-100 text-red-600'     },
}

export default async function HostListingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, year, plate_number, listing_status, weekly_rate_cad, city, avg_rating')
    .eq('host_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles?.length ?? 0} vehicle(s)</p>
        </div>
        <Link href="/host/listings/new" className="btn-primary text-sm px-4"
          style={{ minWidth: 'auto', minHeight: 40 }}>
          <Plus className="w-4 h-4 mr-1" />
          Add listing
        </Link>
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <div className="card p-10 text-center">
          <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900 mb-1">No listings yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Add your first vehicle to start earning on Easy Drive.
          </p>
          <Link href="/host/listings/new" className="btn-primary inline-flex"
            style={{ minWidth: 'auto', minHeight: 40 }}>
            List a vehicle
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(v => {
            const badge = STATUS_BADGE[v.listing_status ?? 'draft']
            return (
              <Link
                key={v.id}
                href={`/host/listings/${v.id}`}
                className="card p-4 flex items-center justify-between hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.plate_number}
                      {v.city && ` · ${v.city}`}
                      {v.avg_rating && ` · ${v.avg_rating} ★`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {v.weekly_rate_cad && (
                    <span className="text-sm font-semibold text-gray-900">
                      ${v.weekly_rate_cad}/wk
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
