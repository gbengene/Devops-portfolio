import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Car, MapPin, Star, Zap } from 'lucide-react'

interface SearchParams {
  city?: string
  min_rate?: string
  max_rate?: string
  transmission?: string
  fuel_type?: string
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createAdminClient()

  let query = supabase
    .from('vehicles')
    .select(`
      id, make, model, year, colour, city, weekly_rate_cad,
      transmission, fuel_type, seats, avg_rating,
      listing_photos!inner (storage_path, is_primary)
    `)
    .eq('listing_status', 'active')
    .order('avg_rating', { ascending: false, nullsFirst: false })

  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`)
  }
  if (searchParams.min_rate) {
    query = query.gte('weekly_rate_cad', Number(searchParams.min_rate))
  }
  if (searchParams.max_rate) {
    query = query.lte('weekly_rate_cad', Number(searchParams.max_rate))
  }
  if (searchParams.transmission) {
    query = query.eq('transmission', searchParams.transmission)
  }
  if (searchParams.fuel_type) {
    query = query.eq('fuel_type', searchParams.fuel_type)
  }

  const { data: vehicles } = await query.limit(50) as { data: any[] | null }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-navy text-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">Browse vehicles</h1>
          <p className="text-blue-200 text-sm">Insured, GPS-tracked cars available in the GTA</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <form className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              defaultValue={searchParams.city}
              placeholder="Toronto, Mississauga..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min rate</label>
            <input
              type="number"
              name="min_rate"
              defaultValue={searchParams.min_rate}
              placeholder="200"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-24"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max rate</label>
            <input
              type="number"
              name="max_rate"
              defaultValue={searchParams.max_rate}
              placeholder="500"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-24"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Transmission</label>
            <select
              name="transmission"
              defaultValue={searchParams.transmission}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Any</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fuel type</label>
            <select
              name="fuel_type"
              defaultValue={searchParams.fuel_type}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Any</option>
              <option value="gasoline">Gasoline</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm" style={{ minWidth: 'auto', minHeight: 38 }}>
            Search
          </button>
        </form>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <p className="text-sm text-gray-500 mb-4">
          {vehicles?.length ?? 0} vehicle(s) available
        </p>

        {!vehicles || vehicles.length === 0 ? (
          <div className="card p-10 text-center">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-1">No vehicles found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}

        {/* CTA for unapproved renters */}
        <div className="mt-10 card p-6 text-center bg-navy text-white border-0">
          <h3 className="font-bold text-lg mb-2">Ready to book?</h3>
          <p className="text-blue-200 text-sm mb-4">Apply as a renter — approval takes under 24 hours.</p>
          <Link href="/apply-renter" className="btn-primary inline-flex justify-center"
            style={{ minHeight: 44, minWidth: 'auto', background: 'var(--color-primary)' }}>
            Apply as a renter
          </Link>
        </div>
      </div>
    </div>
  )
}

function VehicleCard({ vehicle }: { vehicle: any }) {
  const primaryPhoto = vehicle.listing_photos?.find((p: any) => p.is_primary) ?? vehicle.listing_photos?.[0]

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Photo placeholder — real URLs would be signed via Supabase Storage */}
      <div className="h-44 bg-gray-100 flex items-center justify-center">
        {primaryPhoto ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        ) : (
          <Car className="w-12 h-12 text-gray-300" />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.avg_rating && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Star className="w-3 h-3" />
              {vehicle.avg_rating}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {vehicle.city && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {vehicle.city}
            </span>
          )}
          {vehicle.transmission && (
            <span className="text-xs text-gray-500 capitalize">{vehicle.transmission}</span>
          )}
          {vehicle.fuel_type === 'hybrid' || vehicle.fuel_type === 'electric' ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Zap className="w-3 h-3" />
              {vehicle.fuel_type}
            </span>
          ) : null}
          {vehicle.seats && (
            <span className="text-xs text-gray-500">{vehicle.seats} seats</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900">${vehicle.weekly_rate_cad}</span>
            <span className="text-xs text-gray-400">/wk</span>
          </div>
          <Link href="/apply-renter" className="btn-primary text-xs px-3"
            style={{ minWidth: 'auto', minHeight: 32 }}>
            Book now
          </Link>
        </div>
      </div>
    </div>
  )
}
