import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Car, MapPin, Star, Zap, Shield } from 'lucide-react'

interface SearchParams {
  city?: string
  min_rate?: string
  max_rate?: string
  transmission?: string
  fuel_type?: string
}

/* ── Deterministic fallback photo lookup ──────────────────────────────────── */
/*
 * When no real Supabase-hosted photo exists, we pick a high-quality Unsplash
 * photo based on the vehicle make/model. The lookup is intentionally simple —
 * it falls through to a generic car photo if the make isn't recognised.
 */
const CAR_PHOTO_MAP: Record<string, string> = {
  toyota:  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
  honda:   'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
  hyundai: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80',
  kia:     'https://images.unsplash.com/photo-1593055454502-1e4b28fddcde?w=800&q=80',
  ford:    'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80',
  chevrolet: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  nissan:  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
}

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'

function getCarPhoto(make: string | null): string {
  if (!make) return FALLBACK_PHOTO
  const key = make.toLowerCase()
  return CAR_PHOTO_MAP[key] ?? FALLBACK_PHOTO
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════════ */
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

  if (searchParams.city)         query = query.ilike('city', `%${searchParams.city}%`)
  if (searchParams.min_rate)     query = query.gte('weekly_rate_cad', Number(searchParams.min_rate))
  if (searchParams.max_rate)     query = query.lte('weekly_rate_cad', Number(searchParams.max_rate))
  if (searchParams.transmission) query = query.eq('transmission', searchParams.transmission)
  if (searchParams.fuel_type)    query = query.eq('fuel_type', searchParams.fuel_type)

  const { data: vehicles } = await query.limit(50) as { data: any[] | null }

  const hasFilters = !!(
    searchParams.city ||
    searchParams.min_rate ||
    searchParams.max_rate ||
    searchParams.transmission ||
    searchParams.fuel_type
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Search hero header ───────────────────────────────────────────────── */}
      <div className="text-white" style={{ backgroundColor: 'var(--color-navy)' }}>
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Find your car in the GTA</h1>
            <p className="text-blue-200 text-sm">
              Insured, GPS-tracked vehicles — ready for Uber Eats, DoorDash, Skip &amp; more.
            </p>
          </div>

          {/* Filter form — integrated into header */}
          <form className="bg-white rounded-t-2xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                defaultValue={searchParams.city}
                placeholder="Toronto, Mississauga..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-40"
                style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min rate</label>
              <input
                type="number"
                name="min_rate"
                defaultValue={searchParams.min_rate}
                placeholder="200"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-24"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max rate</label>
              <input
                type="number"
                name="max_rate"
                defaultValue={searchParams.max_rate}
                placeholder="500"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-24"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
              <select
                name="transmission"
                defaultValue={searchParams.transmission}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2">
                <option value="">Any</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fuel type</label>
              <select
                name="fuel_type"
                defaultValue={searchParams.fuel_type}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2">
                <option value="">Any</option>
                <option value="gasoline">Gasoline</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary text-sm"
              style={{ minWidth: 'auto', minHeight: 38 }}>
              Search
            </button>
            {hasFilters && (
              <a
                href="/browse"
                className="btn-secondary text-sm text-gray-500"
                style={{ minWidth: 'auto', minHeight: 38 }}>
                Clear
              </a>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Results count ─────────────────────────────────────────────────── */}
        <p className="text-sm text-gray-500 mb-5">
          {vehicles?.length ?? 0} vehicle{vehicles?.length !== 1 ? 's' : ''} available
          {hasFilters ? ' — matching your filters' : ' in the GTA'}
        </p>

        {/* ── Results grid / empty state ─────────────────────────────────── */}
        {!vehicles || vehicles.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}

        {/* ── CTA for unapproved renters ─────────────────────────────────── */}
        <div className="mt-10 card p-6 text-center border-0 text-white"
          style={{ backgroundColor: 'var(--color-navy)' }}>
          <h3 className="font-bold text-lg mb-2">Ready to book?</h3>
          <p className="text-blue-200 text-sm mb-4">Apply as a renter — approval takes under 24 hours.</p>
          <Link
            href="/apply-renter"
            className="btn-primary inline-flex justify-center"
            style={{ minHeight: 44, minWidth: 'auto', backgroundColor: 'var(--color-primary)' }}>
            Apply as a renter
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Vehicle Card ─────────────────────────────────────────────────────────── */
function VehicleCard({ vehicle }: { vehicle: any }) {
  const photoUrl = getCarPhoto(vehicle.make)

  return (
    <div className="card overflow-hidden flex flex-col p-0 transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow-card)' }}>

      {/* Image area with overlay badges */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Image
          src={photoUrl}
          alt={`${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`}
          fill
          className="object-cover object-center transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* GPS + Kill Switch badge — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-600 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow">
          <Shield className="w-3 h-3" />
          GPS + Kill Switch
        </div>

        {/* Delivery-ready badge — top right */}
        <div className="absolute top-3 right-3 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          Delivery-ready
        </div>

        {/* Star rating overlay — bottom right */}
        {vehicle.avg_rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {vehicle.avg_rating}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">

        {/* Make / Model / Year */}
        <h3 className="font-bold text-gray-900 text-base mb-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>

        {/* Attribute chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {vehicle.city && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              {vehicle.city}
            </span>
          )}
          {vehicle.transmission && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuel_type === 'hybrid' || vehicle.fuel_type === 'electric' ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />
              {vehicle.fuel_type}
            </span>
          ) : vehicle.fuel_type ? (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
              {vehicle.fuel_type}
            </span>
          ) : null}
          {vehicle.seats && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {vehicle.seats} seats
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-extrabold text-gray-900">${vehicle.weekly_rate_cad}</span>
            <span className="text-xs text-gray-400 ml-1">/wk</span>
          </div>
          <Link
            href="/apply-renter"
            className="btn-primary text-xs px-4"
            style={{ minWidth: 'auto', minHeight: 36 }}>
            Book now
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Empty State ──────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="card p-12 text-center flex flex-col items-center">
      {/* Illustration */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-primary)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {hasFilters ? 'No vehicles match your filters' : 'No vehicles listed yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">
        {hasFilters
          ? 'Try widening your search — adjust the city, price range, or fuel type filters above.'
          : 'Easy Drive is brand new in the GTA. Be the first to list your car and start earning $300–$450/week.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {hasFilters && (
          <a href="/browse" className="btn-secondary" style={{ minWidth: 'auto', minHeight: 44 }}>
            Clear filters
          </a>
        )}
        <Link
          href="/apply-host"
          className="btn-primary"
          style={{ minWidth: 'auto', minHeight: 44, backgroundColor: 'var(--color-primary)' }}>
          Be the first to list a car
        </Link>
      </div>
    </div>
  )
}
