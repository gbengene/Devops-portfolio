'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Vehicle { id: string; make: string; model: string; year: number; plate_number: string; colour: string }

interface Props {
  applicationId:  string
  availableVehicles: Vehicle[]
  allChecksPass:  boolean
}

const RATE_OPTIONS = [300, 330, 370, 400, 420, 450]

export function ApplicationReviewForm({ applicationId, availableVehicles, allChecksPass }: Props) {
  const router  = useRouter()
  const [tab, setTab]               = useState<'approve' | 'reject'>('approve')
  const [vehicleId, setVehicleId]   = useState(availableVehicles[0]?.id ?? '')
  const [rate, setRate]             = useState(300)
  const [reason, setReason]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleApprove() {
    if (!vehicleId) { setError('Select a vehicle first.'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/applications/${applicationId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', vehicleId, weeklyRateCad: rate }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); setLoading(false); return }
    router.push('/admin/applications')
    router.refresh()
  }

  async function handleReject() {
    if (reason.length < 10) { setError('Please provide a reason (at least 10 characters).'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/applications/${applicationId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); setLoading(false); return }
    router.push('/admin/applications')
    router.refresh()
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Review Decision</h2>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setTab('approve')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === 'approve' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => setTab('reject')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === 'reject' ? 'bg-white shadow-sm text-red-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ✕ Reject
        </button>
      </div>

      {error && (
        <div className="alert-critical">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Approve panel */}
      {tab === 'approve' && (
        <div className="space-y-4">
          {!allChecksPass && (
            <div className="alert-warning">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  One or more auto-checks failed. Review carefully before approving.
                </p>
              </div>
            </div>
          )}

          {/* Vehicle selector */}
          <div>
            <label className="label">Assign Vehicle</label>
            {availableVehicles.length === 0 ? (
              <div className="alert-warning">
                <p className="text-sm text-amber-800">No vehicles currently available. Add a vehicle to fleet first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableVehicles.map(v => (
                  <label key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      vehicleId === v.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ borderColor: vehicleId === v.id ? 'var(--color-primary)' : undefined }}>
                    <input type="radio" name="vehicle" value={v.id}
                      checked={vehicleId === v.id}
                      onChange={() => setVehicleId(v.id)}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {v.year} {v.make} {v.model} · {v.colour}
                      </p>
                      <p className="font-plate text-xs text-gray-500">{v.plate_number}</p>
                    </div>
                    <span className="badge-available">Available</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rate picker */}
          <div>
            <label className="label">Weekly Rental Rate</label>
            <div className="grid grid-cols-3 gap-2">
              {RATE_OPTIONS.map(r => (
                <button key={r}
                  onClick={() => setRate(r)}
                  className={`py-2.5 text-sm font-semibold rounded-lg border transition-all ${
                    rate === r
                      ? 'border-primary text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ background: rate === r ? 'var(--color-primary)' : undefined,
                           borderColor: rate === r ? 'var(--color-primary)' : undefined }}>
                  ${r}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Deposit collected</span>
              <span className="font-semibold">$500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">First week's rent</span>
              <span className="font-semibold">${rate}</span>
            </div>
            <div className="border-t border-gray-200 pt-1.5 flex justify-between">
              <span className="text-gray-700 font-medium">Day 1 collection</span>
              <span className="font-bold text-gray-900">${500 + rate}</span>
            </div>
          </div>

          <button
            onClick={handleApprove}
            disabled={loading || !vehicleId}
            className="btn-primary w-full justify-center"
            style={{ minWidth: 0 }}>
            {loading ? 'Processing…' : '✓ Approve & Send Agreement'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Applicant will receive an SMS + email with their signing link immediately.
          </p>
        </div>
      )}

      {/* Reject panel */}
      {tab === 'reject' && (
        <div className="space-y-4">
          <div>
            <label className="label">Reason for rejection *</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Licence suspended at time of application. You may re-apply in 30 days."
              rows={4}
              className="input resize-none"
              style={{ minHeight: 'auto', height: 'auto' }}
            />
            <p className="text-xs text-gray-400 mt-1">{reason.length}/200 · Sent to applicant by SMS</p>
          </div>

          <button
            onClick={handleReject}
            disabled={loading || reason.length < 10}
            className="btn-danger w-full justify-center"
            style={{ minWidth: 0 }}>
            {loading ? 'Processing…' : '✕ Reject Application'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Applicant will be notified by SMS with the reason provided.
          </p>
        </div>
      )}
    </div>
  )
}
