'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

const HostApplicationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().regex(/^\+1\d{10}$/, 'Phone must be in format +1XXXXXXXXXX'),
  city:      z.string().min(1, 'City is required'),
  vehicle_count: z.number().int().min(1).max(20),
  has_insurance:    z.literal(true, { errorMap: () => ({ message: 'Commercial insurance is required' }) }),
  has_bouncie:      z.literal(true, { errorMap: () => ({ message: 'Bouncie GPS device is required' }) }),
})

export default function ApplyHostPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)
    const raw = {
      full_name:     fd.get('full_name') as string,
      email:         fd.get('email') as string,
      phone:         fd.get('phone') as string,
      city:          fd.get('city') as string,
      vehicle_count: Number(fd.get('vehicle_count')),
      has_insurance: fd.get('has_insurance') === 'on' ? true as const : false as const,
      has_bouncie:   fd.get('has_bouncie') === 'on' ? true as const : false as const,
    }

    const parsed = HostApplicationSchema.safeParse(raw)
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }

    setSubmitting(true)
    try {
      // For now: the host application triggers account creation + redirect to login
      // Full implementation would POST to /api/host/apply and handle auth signup
      router.push('/login?role=host&applied=1')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-navy">
            Easy<span className="text-primary">Drive</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">List your car on Easy Drive</h1>
          <p className="text-sm text-gray-500">
            Earn $300–$450/week per vehicle renting to verified GTA gig drivers.
          </p>
        </div>

        {/* What hosts need */}
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Requirements</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Valid commercial insurance covering P2P rental and delivery use',
              'Bouncie GPS device installed in the vehicle',
              'Vehicle must be 2010 or newer',
              'Stripe account (to receive payouts — we guide you through this)',
            ].map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">&#10003;</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input type="text" name="full_name" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+1XXXXXXXXXX)</label>
              <input type="tel" name="phone" placeholder="+14161234567" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" placeholder="Toronto" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of vehicles</label>
              <input type="number" name="vehicle_count" min={1} max={20} defaultValue={1} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="has_insurance" className="mt-0.5 rounded" required />
              <span className="text-sm text-gray-700">
                I have (or will obtain) commercial insurance covering P2P rental and delivery use in Ontario
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="has_bouncie" className="mt-0.5 rounded" required />
              <span className="text-sm text-gray-700">
                I have (or will install) a Bouncie GPS tracker in my vehicle(s)
              </span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center"
            style={{ minHeight: 48 }}>
            {submitting ? 'Submitting...' : 'Apply as a host'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
