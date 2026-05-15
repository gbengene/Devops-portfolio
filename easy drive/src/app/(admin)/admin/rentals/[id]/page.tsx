import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, FileText, Wrench } from 'lucide-react'
import { KillSwitchPanel } from './KillSwitchPanel'

export const dynamic = 'force-dynamic'

export default async function RentalDetail({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      id, status, weekly_rate_cad, deposit_cad, start_date, end_date,
      pandadoc_document_id, pandadoc_status,
      stripe_subscription_id, stripe_deposit_intent_id,
      vehicles!vehicle_id (
        id, make, model, year, plate_number, colour,
        kill_switch_enabled, bouncie_device_id, odometer_km
      ),
      profiles!renter_id (
        id, full_name, phone, email, gig_platform
      )
    `)
    .eq('id', params.id)
    .single() as { data: any }

  if (!rental) notFound()

  const { data: payments } = await supabase
    .from('payments')
    .select('id, type, amount_cad, status, paid_at, created_at, failure_reason')
    .eq('rental_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: recentGps } = await supabase
    .from('gps_events')
    .select('lat, lng, speed_kmh, occurred_at, event_type')
    .eq('vehicle_id', rental.vehicles.id)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const vehicle = rental.vehicles
  const renter  = rental.profiles
  const totalPaid = (payments ?? []).filter(p => p.status === 'paid' && p.type === 'weekly_rent')
    .reduce((s: number, p: any) => s + p.amount_cad, 0)

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/rentals" className="btn-ghost p-2" style={{ minWidth: 'auto' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              {renter.full_name}
              <span className="font-plate text-lg text-gray-400 font-normal ml-2">/ {vehicle.plate_number}</span>
            </h1>
            <StatusBadge status={rental.status} />
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {rental.start_date
              ? `Started ${new Date(rental.start_date).toLocaleDateString('en-CA', { dateStyle: 'long' })}`
              : 'Start date pending'}
            {' · '}${rental.weekly_rate_cad}/week
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Renter + Vehicle info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Renter</h2>
              <p className="font-semibold text-gray-900 mb-2">{renter.full_name}</p>
              <div className="space-y-2">
                <a href={`tel:${renter.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" />{renter.phone}
                </a>
                <a href={`mailto:${renter.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="w-4 h-4" />{renter.email}
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Platform</p>
                <p className="text-sm font-medium text-gray-800 capitalize mt-0.5">
                  {renter.gig_platform?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vehicle</h2>
              <p className="font-semibold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="font-plate text-sm text-gray-500 mt-0.5">{vehicle.plate_number}</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Colour</span>
                  <span className="text-gray-800 capitalize">{vehicle.colour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kill switch</span>
                  <span className={vehicle.kill_switch_enabled ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {vehicle.kill_switch_enabled ? 'ENABLED' : 'Off'}
                  </span>
                </div>
              </div>
              {recentGps && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={`https://www.google.com/maps?q=${recentGps.lat},${recentGps.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <MapPin className="w-3.5 h-3.5" />
                    Last seen {new Date(recentGps.occurred_at).toLocaleTimeString('en-CA', { timeStyle: 'short' })}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Payment history */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Payment History</h2>
              <span className="text-xs text-gray-400">
                ${totalPaid.toLocaleString()} collected total
              </span>
            </div>
            {!payments?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">No payments yet</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p: any) => (
                  <div key={p.id} className={`flex items-center justify-between py-2 border-b border-gray-50 last:border-0 ${
                    p.status === 'failed' ? 'bg-red-50 -mx-5 px-5 rounded' : ''
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <PaymentIcon status={p.status} />
                      <div>
                        <p className="text-sm text-gray-800 capitalize">
                          {p.type.replace('_', ' ')}
                        </p>
                        {p.failure_reason && (
                          <p className="text-xs text-red-600">{p.failure_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${p.status === 'failed' ? 'text-red-600' : 'text-gray-900'}`}>
                        ${p.amount_cad}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString('en-CA')
                          : new Date(p.created_at).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            {rental.pandadoc_document_id && (
              <a
                href={`https://app.pandadoc.com/s/${rental.pandadoc_document_id}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-sm gap-2" style={{ minWidth: 'auto', minHeight: 40 }}>
                <FileText className="w-4 h-4" />View Agreement
              </a>
            )}
            <Link href={`/admin/fleet/${vehicle.id}`}
              className="btn-secondary text-sm gap-2" style={{ minWidth: 'auto', minHeight: 40 }}>
              <Wrench className="w-4 h-4" />Vehicle Log
            </Link>
          </div>
        </div>

        {/* ── Right column: Kill switch ──────────────────────────────────── */}
        <div className="space-y-5">
          <KillSwitchPanel
            rentalId={params.id}
            plate={vehicle.plate_number}
            renterName={renter.full_name}
            currentlyEnabled={vehicle.kill_switch_enabled}
            isActive={rental.status === 'active'}
            hasDevice={!!vehicle.bouncie_device_id}
          />

          {/* Deposit status */}
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Deposit</h2>
            <p className="text-2xl font-bold text-gray-900">${rental.deposit_cad}</p>
            <p className="text-xs text-gray-400 mt-1">
              {rental.stripe_deposit_intent_id ? 'On hold — not charged' : 'Not collected'}
            </p>
          </div>

          {/* Agreement status */}
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Agreement</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${rental.pandadoc_status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="text-sm text-gray-700 capitalize">
                {rental.pandadoc_status ?? 'Not sent'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:             'badge-active', pending_payment: 'badge-pending',
    pending_signature:  'badge-pending', ended: 'badge-terminated', terminated: 'badge-terminated',
  }
  return <span className={map[status] ?? 'badge'}>{status.replace('_', ' ')}</span>
}

function PaymentIcon({ status }: { status: string }) {
  if (status === 'paid')    return <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
  if (status === 'failed')  return <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">✕</span>
  if (status === 'refunded') return <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">↩</span>
  return <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">…</span>
}
