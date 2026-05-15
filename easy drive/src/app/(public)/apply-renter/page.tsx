'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'

const RenterSchema = z.object({
  full_name:              z.string().min(2, 'Full name is required'),
  phone:                  z.string().regex(/^\+1\d{10}$/, 'Phone must be in format +1XXXXXXXXXX'),
  ontario_licence_number: z.string().min(5, 'Licence number required'),
  licence_class:          z.enum(['G', 'G2']),
  at_fault_accidents:     z.number().int().min(0).max(10),
  licence_suspended:      z.boolean(),
  gig_platform:           z.enum(['uber_eats', 'doordash', 'skip', 'instacart']),
})

export default function ApplyRenterPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)
    const raw = {
      full_name:              fd.get('full_name') as string,
      phone:                  fd.get('phone') as string,
      ontario_licence_number: fd.get('ontario_licence_number') as string,
      licence_class:          fd.get('licence_class') as 'G' | 'G2',
      at_fault_accidents:     Number(fd.get('at_fault_accidents') ?? 0),
      licence_suspended:      fd.get('licence_suspended') === 'true',
      gig_platform:           fd.get('gig_platform') as 'uber_eats' | 'doordash' | 'skip' | 'instacart',
    }

    const parsed = RenterSchema.safeParse(raw)
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    // Auto-reject rules (same as API)
    if (parsed.data.licence_suspended) {
      setError('Applications with a suspended licence cannot be accepted.')
      return
    }
    if (parsed.data.at_fault_accidents >= 3) {
      setError('Applications with 3 or more at-fault accidents cannot be accepted.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Submission failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl font-bold">&#10003;</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Application submitted!</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We will review your application within 24 hours and notify you by SMS.
            Once approved, you can log in to browse available vehicles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-navy">
            Easy<span className="text-primary">Drive</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Apply as a renter</h1>
          <p className="text-sm text-gray-500">
            Rent insured, GPS-tracked vehicles for Uber Eats, DoorDash, and Skip deliveries.
            No hard credit check.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input type="text" name="full_name" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+1XXXXXXXXXX)</label>
            <input type="tel" name="phone" placeholder="+14161234567" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ontario licence number</label>
              <input type="text" name="ontario_licence_number" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Licence class</label>
              <select name="licence_class" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select...</option>
                <option value="G">G (full)</option>
                <option value="G2">G2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">At-fault accidents (last 3 years)</label>
            <select name="at_fault_accidents" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3+">3 or more</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Licence ever suspended?</label>
            <select name="licence_suspended" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gig platform</label>
            <select name="gig_platform" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select...</option>
              <option value="uber_eats">Uber Eats</option>
              <option value="doordash">DoorDash</option>
              <option value="skip">SkipTheDishes</option>
              <option value="instacart">Instacart</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center"
            style={{ minHeight: 48 }}>
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Already approved?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
