import { createClient } from '@/lib/supabase/server'
import { AlertFeed } from '@/components/admin/AlertFeed'
import { FleetSummary } from '@/components/admin/FleetSummary'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [vehiclesRes, alertsRes, rentalsRes, revenueRes] = await Promise.all([
    supabase.from('vehicles').select('id, status'),
    supabase
      .from('alerts')
      .select('id, type, severity, message, created_at, vehicles(plate_number)')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('rentals')
      .select('id, status, weekly_rate_cad, profiles!renter_id(full_name), vehicles!vehicle_id(plate_number)')
      .eq('status', 'active'),
    supabase
      .from('payments')
      .select('amount_cad')
      .eq('status', 'paid')
      .eq('type', 'weekly_rent')
      .gte('paid_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const vehicles     = vehiclesRes.data ?? []
  const alerts       = alertsRes.data ?? []
  const activeRentals = rentalsRes.data ?? []
  const monthlyGross = (revenueRes.data ?? []).reduce((sum, p) => sum + p.amount_cad, 0)

  const stats = {
    totalVehicles:    vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    rentedVehicles:   vehicles.filter(v => v.status === 'rented').length,
    activeRentals:    activeRentals.length,
    unacknowledgedAlerts: alerts.length,
    monthlyGross,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Easy Drive — Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Fleet overview and real-time alerts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Rentals"     value={stats.activeRentals}        />
        <KPICard label="Available Vehicles" value={stats.availableVehicles}    />
        <KPICard label="Open Alerts"        value={stats.unacknowledgedAlerts} accent={stats.unacknowledgedAlerts > 0} />
        <KPICard label="Revenue This Month" value={`$${monthlyGross.toLocaleString()}`} />
      </div>

      {/* Two-column layout: Fleet + Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <FleetSummary rentals={activeRentals as any} />
        <AlertFeed    alerts={alerts as any} />
      </div>
    </div>
  )
}

function KPICard({ label, value, accent = false }: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}
