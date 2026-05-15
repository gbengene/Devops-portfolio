import { createAdminClient, createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Zap, Users, Shield, Star, Info } from 'lucide-react'
import { BookingRequestForm } from './BookingRequestForm'

const CAR_PHOTO_MAP: Record<string, string> = {
  toyota:    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
  honda:     'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
  hyundai:   'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80',
  kia:       'https://images.unsplash.com/photo-1593055454502-1e4b28fddcde?w=800&q=80',
  ford:      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80',
  chevrolet: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  nissan:    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
}

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'

function getCarPhoto(make: string | null): string {
  if (!make) return FALLBACK_PHOTO
  return CAR_PHOTO_MAP[make.toLowerCase()] ?? FALLBACK_PHOTO
}

function VehicleFeatureRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
      <span>{label}</span>
    </div>
  )
}

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const adminClient = createAdminClient()

  const { data: vehicle } = await adminClient
    .from('vehicles')
    .select(`
      id, make, model, year, colour, city, weekly_rate_cad,
      transmission, fuel_type, seats, avg_rating, host_id,
      pickup_postal_code, listing_status
    `)
    .eq('id', params.id)
    .eq('listing_status', 'active')
    .single() as { data: any }

  if (!vehicle) notFound()

  const { data: host } = await adminClient
    .from('profiles')
    .select('id, full_name, avg_rating_as_host, rentals_completed_as_host')
    .eq('id', vehicle.host_id)
    .single() as { data: any }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let renterStatus: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('renter_status')
      .eq('auth_user_id', user.id)
      .single() as { data: any }
    renterStatus = profile?.renter_status ?? null
  }

  const photoUrl = getCarPhoto(vehicle.make)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        {/* Hero image */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 bg-gray-100">
          <Image
            src={photoUrl}
            alt={`${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
              <Shield className="w-3 h-3" />
              GPS + Kill Switch
            </span>
            <span
              className="inline-flex items-center text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              Delivery-ready
            </span>
          </div>
          {vehicle.avg_rating && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-2.5 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {vehicle.avg_rating}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left column: vehicle info */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.colour && (
                <p className="text-sm text-gray-500 mt-1 capitalize">{vehicle.colour}</p>
              )}
            </div>

            {/* Attribute chips */}
            <div className="flex flex-wrap gap-2">
              {vehicle.city && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {vehicle.city}
                </span>
              )}
              {vehicle.transmission && (
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full capitalize">
                  {vehicle.transmission}
                </span>
              )}
              {vehicle.fuel_type === 'hybrid' || vehicle.fuel_type === 'electric' ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  {vehicle.fuel_type}
                </span>
              ) : vehicle.fuel_type ? (
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full capitalize">
                  {vehicle.fuel_type}
                </span>
              ) : null}
              {vehicle.seats && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  {vehicle.seats} seats
                </span>
              )}
            </div>

            {/* Pricing summary */}
            <div className="card">
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-extrabold text-gray-900">${vehicle.weekly_rate_cad}</span>
                <span className="text-sm text-gray-400">/week</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Refundable deposit</span>
                  <span className="font-medium text-gray-900">$500</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee</span>
                  <span className="font-medium text-gray-900">
                    ${Math.round(vehicle.weekly_rate_cad * 0.20)}/wk
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle features */}
            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">What&apos;s included</h2>
              <VehicleFeatureRow icon={Shield} label="Real-time GPS tracking" />
              <VehicleFeatureRow icon={Shield} label="Remote kill switch for security" />
              <VehicleFeatureRow icon={Zap}    label="Delivery-platform ready (Uber Eats, DoorDash, Skip)" />
              {vehicle.pickup_postal_code && (
                <VehicleFeatureRow icon={MapPin} label={`Pickup near ${vehicle.pickup_postal_code}`} />
              )}
            </div>

            {/* Host info */}
            {host && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">About the host</h2>
                <p className="text-gray-800 font-medium">{host.full_name}</p>
                <div className="mt-2 space-y-1">
                  {host.avg_rating_as_host != null && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{host.avg_rating_as_host} host rating</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {host.rentals_completed_as_host ?? 0} rental{host.rentals_completed_as_host !== 1 ? 's' : ''} completed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right column: CTA / booking form */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              {!user ? (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-900">Ready to drive?</h2>
                  <p className="text-sm text-gray-500">
                    Apply as a renter — approval takes under 24 hours.
                  </p>
                  <Link
                    href="/apply-renter"
                    className="btn-primary block text-center"
                    style={{ minHeight: 44 }}>
                    Apply as a renter
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary block text-center text-sm"
                    style={{ minHeight: 40 }}>
                    Already applied? Sign in
                  </Link>
                </div>
              ) : renterStatus !== 'approved' ? (
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Application under review</p>
                    <p className="text-sm text-gray-500 mt-1">
                      We&apos;re reviewing your application. You&apos;ll hear back within 24 hours.
                    </p>
                    <Link
                      href="/portal"
                      className="inline-block mt-3 text-sm font-medium"
                      style={{ color: 'var(--color-primary)' }}>
                      View your dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-4">Request to book</h2>
                  <BookingRequestForm vehicleId={vehicle.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
