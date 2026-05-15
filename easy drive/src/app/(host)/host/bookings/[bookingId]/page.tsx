'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BookingDetail {
  id: string
  status: string
  start_date: string
  end_date: string | null
  weekly_rate_cad: number
  platform_fee_cad: number
  deposit_cad: number
  notes: string | null
  vehicles: {
    make: string
    model: string
    year: number
    plate_number: string
  }
  renter: {
    full_name: string
    phone: string | null
    email: string
    avg_rating_as_renter: number | null
    rentals_completed_as_renter: number
  }
}

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [acting, setActing]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    fetch(`/api/host/bookings/${bookingId}`)
      .then(r => r.json() as Promise<BookingDetail>)
      .then(setBooking)
  }, [bookingId])

  async function handleAction(action: 'accept' | 'decline') {
    setActing(true)
    setError(null)
    try {
      const res = await fetch(`/api/host/bookings/${bookingId}/${action}`, { method: 'POST' })
      const json = await res.json() as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Action failed'); return }
      setDone(true)
      setBooking(prev => prev ? { ...prev, status: action === 'accept' ? 'confirmed' : 'declined' } : prev)
    } catch {
      setError('Network error.')
    } finally {
      setActing(false)
    }
  }

  if (!booking) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  const hostEarnings = booking.weekly_rate_cad - booking.platform_fee_cad

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Booking request</h1>
      <p className="text-sm text-gray-500 mb-6">#{booking.id.slice(0, 8)}</p>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Vehicle */}
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vehicle</p>
          <p className="font-semibold text-gray-900">
            {booking.vehicles.year} {booking.vehicles.make} {booking.vehicles.model}
          </p>
          <p className="text-sm text-gray-500">{booking.vehicles.plate_number}</p>
        </div>

        {/* Renter */}
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Renter</p>
          <p className="font-semibold text-gray-900">{booking.renter.full_name}</p>
          <p className="text-sm text-gray-500">{booking.renter.phone ?? booking.renter.email}</p>
          {booking.renter.avg_rating_as_renter && (
            <p className="text-xs text-gray-400 mt-1">
              {booking.renter.avg_rating_as_renter} ★ · {booking.renter.rentals_completed_as_renter} rental(s)
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dates</p>
          <p className="text-sm text-gray-900">From {booking.start_date}</p>
          {booking.end_date && <p className="text-sm text-gray-500">To {booking.end_date}</p>}
        </div>

        {/* Financials */}
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Payout</p>
          <p className="font-bold text-green-700 text-lg">${hostEarnings}/wk</p>
          <p className="text-xs text-gray-400">(after 20% platform fee)</p>
          <p className="text-xs text-gray-400 mt-1">Deposit held: ${booking.deposit_cad}</p>
        </div>
      </div>

      {booking.notes && (
        <div className="card p-4 mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Renter note</p>
          <p className="text-sm text-gray-700">{booking.notes}</p>
        </div>
      )}

      {/* Actions */}
      {booking.status === 'requested' && !done && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAction('accept')}
            disabled={acting}
            className="btn-primary flex items-center gap-2"
            style={{ minHeight: 44, minWidth: 'auto' }}
          >
            <CheckCircle className="w-4 h-4" />
            Accept booking
          </button>
          <button
            onClick={() => handleAction('decline')}
            disabled={acting}
            className="btn-secondary flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            style={{ minHeight: 44, minWidth: 'auto' }}
          >
            <XCircle className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}

      {done && (
        <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          Booking {booking.status}. The renter has been notified.
        </div>
      )}

      {booking.status !== 'requested' && !done && (
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
          This booking is already <strong>{booking.status}</strong> — no further action required.
        </div>
      )}
    </div>
  )
}
