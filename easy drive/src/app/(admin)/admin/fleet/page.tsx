import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Car, AlertTriangle, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Days before expiry at which we surface a warning
const EXPIRY_WARN_DAYS = 30

export default async function FleetPage() {
  const supabase = createClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, plate_number, colour, status,
      odometer_km, kill_switch_enabled,
      safety_cert_expires, plate_renewal_date,
      rentals!vehicle_id (
        id, status, weekly_rate_cad,
        profiles!renter_id ( full_name )
      )
    `)
    .order('created_at', { ascending: false })

  const today = new Date()

  function daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null
    const diff = new Date(dateStr).getTime() - today.getTime()
    return Math.ceil(diff / 86_400_000)
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet</h1>
          <p className="text-sm text-gray-500 mt-1">{vehicles?.length ?? 0} vehicles registered</p>
        </div>
        <Link href="/admin/fleet/add"
          className="btn-primary gap-2" style={{ minWidth: 'auto' }}>
          <Plus className="w-4 h-4" />Add Vehicle
        </Link>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['available', 'rented', 'maintenance', 'inactive'] as const).map(status => {
          const count = vehicles?.filter(v => v.status === status).length ?? 0
          return (
            <div key={status} className="card py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide capitalize">{status}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Vehicle list */}
      {!vehicles?.length ? (
        <EmptyFleet />
      ) : (
        <div className="space-y-3">
          {vehicles.map(vehicle => {
            const activeRental = (vehicle.rentals as any[])?.find(
              r => ['active', 'pending_payment', 'pending_signature'].includes(r.status)
            )
            const certDays   = daysUntil(vehicle.safety_cert_expires)
            const plateDays  = daysUntil(vehicle.plate_renewal_date)
            const certWarn   = certDays !== null && certDays <= EXPIRY_WARN_DAYS
            const plateWarn  = plateDays !== null && plateDays <= EXPIRY_WARN_DAYS

            return (
              <Link key={vehicle.id} href={`/admin/fleet/${vehicle.id}`}>
                <div className="card-hover flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    vehicle.status === 'rented'      ? 'bg-blue-50' :
                    vehicle.status === 'available'   ? 'bg-green-50' :
                    vehicle.status === 'maintenance' ? 'bg-orange-50' : 'bg-gray-50'
                  }`}>
                    <Car className={`w-5 h-5 ${
                      vehicle.status === 'rented'      ? 'text-blue-500' :
                      vehicle.status === 'available'   ? 'text-green-500' :
                      vehicle.status === 'maintenance' ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <VehicleStatusBadge status={vehicle.status} />
                      {vehicle.kill_switch_enabled && (
                        <span className="badge bg-red-100 text-red-700">Kill switch ON</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                      <span className="font-plate">{vehicle.plate_number}</span>
                      <span>{vehicle.odometer_km.toLocaleString()} km</span>
                      {activeRental && (
                        <span className="text-blue-500">
                          → {activeRental.profiles?.full_name} · ${activeRental.weekly_rate_cad}/wk
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiry warnings */}
                  <div className="hidden sm:flex flex-col gap-1 text-right">
                    {certWarn && (
                      <ExpiryWarning label="Safety cert" days={certDays!} />
                    )}
                    {plateWarn && (
                      <ExpiryWarning label="Plate renewal" days={plateDays!} />
                    )}
                  </div>

                  <span className="text-gray-300 text-lg flex-shrink-0">›</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyFleet() {
  return (
    <div className="card text-center py-14">
      <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="font-medium text-gray-700 mb-1">No vehicles yet</p>
      <p className="text-sm text-gray-400 mb-5">Add your first vehicle to get started</p>
      <Link href="/admin/fleet/add" className="btn-primary" style={{ minWidth: 'auto' }}>
        <Plus className="w-4 h-4 mr-1.5" />Add Vehicle
      </Link>
    </div>
  )
}

function VehicleStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available:   'badge-available',
    rented:      'badge-rented',
    maintenance: 'badge-maintenance',
    inactive:    'badge-terminated',
  }
  return <span className={map[status] ?? 'badge'}>{status}</span>
}

function ExpiryWarning({ label, days }: { label: string; days: number }) {
  const isUrgent = days <= 7
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
      <AlertTriangle className="w-3 h-3" />
      <span>{label}: {days <= 0 ? 'EXPIRED' : `${days}d`}</span>
    </div>
  )
}
