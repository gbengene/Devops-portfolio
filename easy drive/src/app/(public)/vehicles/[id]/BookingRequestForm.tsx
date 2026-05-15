'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BookingRequestForm({ vehicleId }: { vehicleId: string }) {
  const router = useRouter()
  const [startDate, setStartDate]   = useState('')
  const [notes, setNotes]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0] as string

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/renter/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId, start_date: startDate, notes: notes || undefined }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json?.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push('/portal')
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred start date
        </label>
        <input
          id="start_date"
          type="date"
          name="start_date"
          required
          min={today}
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes for the host <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any questions or details for the host..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
          style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/500</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !startDate}
        className="btn-primary w-full"
        style={{ minHeight: 44 }}>
        {submitting ? 'Sending request...' : 'Request to book'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        No charge until the host confirms. You&apos;ll be notified within 24 hours.
      </p>
    </form>
  )
}
