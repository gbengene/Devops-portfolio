'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, AlertCircle } from 'lucide-react'

interface VehicleDetail {
  id: string
  make: string
  model: string
  year: number
  plate_number: string
  colour: string | null
  listing_status: string
  weekly_rate_cad: number | null
  city: string | null
  auto_accept_bookings: boolean
  rejection_reason: string | null
}

export default function EditListingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const router = useRouter()

  const [vehicle, setVehicle]     = useState<VehicleDetail | null>(null)
  const [rate, setRate]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    fetch(`/api/host/listings/${vehicleId}`)
      .then(r => r.json() as Promise<VehicleDetail>)
      .then(data => {
        setVehicle(data)
        setRate(String(data.weekly_rate_cad ?? ''))
      })
  }, [vehicleId])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/host/listings/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekly_rate_cad: Number(rate) }),
      })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        setError(j.error ?? 'Save failed')
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(newStatus: 'paused' | 'active' | 'delisted') {
    setError(null)
    const res = await fetch(`/api/host/listings/${vehicleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_status: newStatus }),
    })
    if (res.ok) {
      setVehicle(prev => prev ? { ...prev, listing_status: newStatus } : prev)
    } else {
      const j = await res.json() as { error?: string }
      setError(j.error ?? 'Status update failed')
    }
  }

  if (!vehicle) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-sm text-gray-500">{vehicle.plate_number}{vehicle.city && ` · ${vehicle.city}`}</p>
        </div>
        <Link href={`/host/listings/${vehicleId}/calendar`}
          className="btn-secondary text-sm px-3 flex items-center gap-1"
          style={{ minWidth: 'auto', minHeight: 36 }}>
          <CalendarDays className="w-4 h-4" />
          Availability
        </Link>
      </div>

      {vehicle.rejection_reason && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Listing rejected:</strong> {vehicle.rejection_reason}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          Changes saved.
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-4 mb-4">
        <h2 className="font-semibold text-gray-900">Edit listing</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weekly rate (CAD)</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            min={200}
            max={2000}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary" style={{ minHeight: 40, minWidth: 'auto' }}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {/* Status controls */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Listing status</h2>
        <div className="flex gap-3 flex-wrap">
          {vehicle.listing_status === 'active' && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="btn-secondary text-sm"
              style={{ minWidth: 'auto', minHeight: 38 }}
            >
              Pause listing
            </button>
          )}
          {vehicle.listing_status === 'paused' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="btn-primary text-sm"
              style={{ minWidth: 'auto', minHeight: 38 }}
            >
              Resume listing
            </button>
          )}
          {vehicle.listing_status !== 'delisted' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delist this vehicle? This cannot be undone easily.')) {
                  handleStatusChange('delisted')
                }
              }}
              className="text-sm text-red-600 underline hover:no-underline"
            >
              Delist permanently
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
