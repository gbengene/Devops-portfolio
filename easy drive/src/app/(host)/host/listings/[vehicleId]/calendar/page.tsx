'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Block {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

export default function AvailabilityCalendarPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()

  const [blocks, setBlocks]         = useState<Block[]>([])
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [reason, setReason]         = useState('personal')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function fetchBlocks() {
    const res = await fetch(`/api/host/listings/${vehicleId}/availability`)
    const data = await res.json() as Block[]
    setBlocks(data)
  }

  useEffect(() => { fetchBlocks() }, [vehicleId])

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/host/listings/${vehicleId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate, reason }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Failed to block dates'); return }
      setStartDate('')
      setEndDate('')
      await fetchBlocks()
    } catch {
      setError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(blockId: string) {
    const res = await fetch(`/api/host/listings/${vehicleId}/availability`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_id: blockId }),
    })
    if (res.ok) {
      setBlocks(prev => prev.filter(b => b.id !== blockId))
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Availability calendar</h1>

      <form onSubmit={handleBlock} className="card p-5 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900 text-sm">Block dates</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="personal">Personal use</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Other (blocked)</option>
          </select>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary text-sm" style={{ minWidth: 'auto', minHeight: 38 }}>
          {submitting ? 'Blocking...' : 'Block these dates'}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Current blocks</h2>
        {blocks.length === 0 && (
          <p className="text-sm text-gray-500">No dates blocked — vehicle is fully available.</p>
        )}
        {blocks.map(b => (
          <div key={b.id} className="card p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {b.start_date} to {b.end_date}
              </p>
              <p className="text-xs text-gray-500 capitalize">{b.reason ?? 'blocked'}</p>
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
