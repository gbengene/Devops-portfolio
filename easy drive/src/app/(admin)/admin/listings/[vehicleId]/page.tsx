'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface ListingReview {
  id: string
  make: string
  model: string
  year: number
  plate_number: string
  vin: string
  colour: string | null
  city: string | null
  weekly_rate_cad: number | null
  transmission: string | null
  fuel_type: string | null
  seats: number | null
  bouncie_device_id: string | null
  passtime_device_id: string | null
  insurance_cert_url: string | null
  insurance_cert_expires: string | null
  insurance_covers_delivery: boolean
  listing_status: string
  host: {
    full_name: string
    email: string
    phone: string | null
    stripe_connect_status: string | null
  }
  photos: { id: string; storage_path: string; is_primary: boolean }[]
}

export default function AdminListingReviewPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const router = useRouter()

  const [listing, setListing]       = useState<ListingReview | null>(null)
  const [reason, setReason]         = useState('')
  const [acting, setActing]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [done, setDone]             = useState<'approved' | 'rejected' | null>(null)

  useEffect(() => {
    fetch(`/api/admin/listings/${vehicleId}`)
      .then(r => r.json() as Promise<ListingReview>)
      .then(setListing)
  }, [vehicleId])

  async function handleApprove() {
    setActing(true)
    setError(null)
    const res = await fetch(`/api/admin/listings/${vehicleId}/approve`, { method: 'POST' })
    const json = await res.json() as { error?: string }
    if (!res.ok) { setError(json.error ?? 'Approval failed'); setActing(false); return }
    setDone('approved')
    setTimeout(() => router.push('/admin/listings'), 1500)
  }

  async function handleReject() {
    if (!reason.trim()) { setError('Please provide a rejection reason.'); return }
    setActing(true)
    setError(null)
    const res = await fetch(`/api/admin/listings/${vehicleId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const json = await res.json() as { error?: string }
    if (!res.ok) { setError(json.error ?? 'Rejection failed'); setActing(false); return }
    setDone('rejected')
    setTimeout(() => router.push('/admin/listings'), 1500)
  }

  if (!listing) return <div className="p-6 text-sm text-gray-500">Loading...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        {listing.year} {listing.make} {listing.model}
      </h1>
      <p className="text-sm text-gray-500 mb-6">{listing.plate_number} · {listing.vin}</p>

      {done && (
        <div className={`mb-4 text-sm font-medium rounded-lg p-3 ${
          done === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          Listing {done}. Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Vehicle details */}
        <Detail label="City" value={listing.city ?? '—'} />
        <Detail label="Rate" value={listing.weekly_rate_cad ? `$${listing.weekly_rate_cad}/wk` : '—'} />
        <Detail label="Transmission" value={listing.transmission ?? '—'} />
        <Detail label="Fuel" value={listing.fuel_type ?? '—'} />
        <Detail label="Seats" value={String(listing.seats ?? '—')} />
        <Detail label="Colour" value={listing.colour ?? '—'} />

        {/* Hardware */}
        <Detail label="Bouncie GPS ID" value={listing.bouncie_device_id ?? 'MISSING'} highlight={!listing.bouncie_device_id} />
        <Detail label="PassTime ID" value={listing.passtime_device_id ?? 'Not provided'} />

        {/* Host */}
        <Detail label="Host" value={listing.host.full_name} />
        <Detail label="Host email" value={listing.host.email} />
        <Detail label="Stripe Connect" value={listing.host.stripe_connect_status ?? 'not_started'} />

        {/* Insurance */}
        <div className="col-span-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Insurance</p>
          {listing.insurance_cert_url ? (
            <a
              href={listing.insurance_cert_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View certificate <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-sm text-red-600 font-medium">MISSING — do not approve</span>
          )}
          {listing.insurance_cert_expires && (
            <p className="text-xs text-gray-400 mt-0.5">
              Expires: {listing.insurance_cert_expires}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            Covers delivery: {listing.insurance_covers_delivery ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Photos */}
      {listing.photos.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Photos ({listing.photos.length})</p>
          <p className="text-xs text-gray-400">Photos stored in Supabase Storage. Access via the storage dashboard.</p>
        </div>
      )}

      {/* Actions */}
      {!done && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Review decision</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection reason (required if rejecting)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="E.g. Insurance certificate expired, insufficient photos..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={acting}
              className="btn-primary flex items-center gap-2"
              style={{ minWidth: 'auto', minHeight: 42 }}
            >
              <CheckCircle className="w-4 h-4" />
              Approve listing
            </button>
            <button
              onClick={handleReject}
              disabled={acting || !reason.trim()}
              className="btn-secondary flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              style={{ minWidth: 'auto', minHeight: 42 }}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
