'use client'

import { useState } from 'react'
import { Power, AlertTriangle } from 'lucide-react'

interface Props {
  rentalId:         string
  plate:            string
  renterName:       string
  currentlyEnabled: boolean
  isActive:         boolean
  hasDevice:        boolean
}

export function KillSwitchPanel({
  rentalId, plate, renterName,
  currentlyEnabled, isActive, hasDevice,
}: Props) {
  const [enabled, setEnabled]       = useState(currentlyEnabled)
  const [reason, setReason]         = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const canActivate = isActive && hasDevice

  async function execute(action: 'enable' | 'disable') {
    if (!reason.trim()) { setError('A reason is required before activating.'); return }
    setLoading(true); setError(null); setShowConfirm(false)

    const res = await fetch(`/api/rentals/${rentalId}/killswitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Failed to update kill switch')
      setLoading(false)
      return
    }

    setEnabled(action === 'enable')
    setLastAction(`Kill switch ${action}d at ${new Date().toLocaleTimeString('en-CA')}`)
    setReason('')
    setLoading(false)
  }

  return (
    <>
      <div className={`card border-2 ${enabled ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Power className={`w-5 h-5 ${enabled ? 'text-red-600' : 'text-gray-400'}`} />
          <h2 className="text-sm font-semibold text-gray-700">Ignition Interrupt</h2>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-2 p-2.5 rounded-lg mb-4 ${
          enabled ? 'bg-red-100' : 'bg-green-50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className={`text-sm font-semibold ${enabled ? 'text-red-800' : 'text-green-800'}`}>
            {enabled ? 'ENABLED — Vehicle will not restart' : 'Disabled — Normal operation'}
          </span>
        </div>

        {!canActivate && (
          <div className="alert-info mb-4">
            <p className="text-xs" style={{ color: 'var(--color-navy)' }}>
              {!isActive ? 'Kill switch is only available on active rentals.' : 'No GPS device registered for this vehicle.'}
            </p>
          </div>
        )}

        {canActivate && (
          <div className="space-y-3">
            {/* Reason input — required before button activates */}
            <div>
              <label className="label">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => { setReason(e.target.value); setError(null) }}
                placeholder={enabled
                  ? "e.g. Issue resolved — renter contacted and paid"
                  : "e.g. Non-payment — 3 days overdue, no response"}
                rows={3}
                className="input resize-none text-sm"
                style={{ minHeight: 'auto', height: 'auto' }}
                disabled={loading}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Renter will be notified by SMS · Action is logged and audited
              </p>
            </div>

            {error && (
              <div className="alert-critical">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action button */}
            {enabled ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={loading || !reason.trim()}
                className="btn-secondary w-full justify-center gap-2"
                style={{ minWidth: 0 }}>
                <Power className="w-4 h-4 text-green-600" />
                {loading ? 'Processing…' : 'Disable Kill Switch'}
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={loading || !reason.trim()}
                className="btn-danger w-full justify-center gap-2"
                style={{ minWidth: 0 }}>
                <Power className="w-4 h-4" />
                {loading ? 'Processing…' : 'Enable Kill Switch'}
              </button>
            )}

            {lastAction && (
              <p className="text-xs text-gray-400 text-center">{lastAction}</p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-modal space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {enabled ? 'Disable Kill Switch?' : 'Enable Kill Switch?'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Vehicle: {plate}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm text-gray-700">
              {enabled ? (
                <>
                  <p>• Vehicle <strong>{plate}</strong> will be able to restart normally</p>
                  <p>• {renterName} will be notified</p>
                </>
              ) : (
                <>
                  <p>• Vehicle <strong>{plate}</strong> will not restart after next shutoff</p>
                  <p>• {renterName} will be notified by SMS immediately</p>
                  <p>• This action will be logged with your reason</p>
                </>
              )}
              <div className="pt-1 border-t border-gray-200">
                <p className="text-xs text-gray-500">Reason: <em>{reason}</em></p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1 justify-center"
                style={{ minWidth: 0 }}>
                Cancel
              </button>
              <button
                onClick={() => execute(enabled ? 'disable' : 'enable')}
                className={`flex-1 justify-center ${enabled ? 'btn-secondary' : 'btn-danger'}`}
                style={{ minWidth: 0 }}>
                {enabled ? 'Yes, Disable' : 'Yes, Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
