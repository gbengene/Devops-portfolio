'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { z } from 'zod'
import { CheckCircle, TrendingUp } from 'lucide-react'

const HostApplicationSchema = z.object({
  full_name:     z.string().min(2, 'Full name is required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().regex(/^\+1\d{10}$/, 'Phone must be in format +1XXXXXXXXXX'),
  city:          z.string().min(1, 'City is required'),
  vehicle_count: z.number().int().min(1).max(20),
  has_insurance: z.literal(true, { errorMap: () => ({ message: 'Commercial insurance is required' }) }),
  has_bouncie:   z.literal(true, { errorMap: () => ({ message: 'Bouncie GPS device is required' }) }),
})

const requirements = [
  'Valid commercial insurance covering P2P rental and delivery use',
  'Bouncie GPS device installed in the vehicle',
  'Vehicle must be 2010 or newer',
  'Stripe account (to receive payouts — we guide you through this)',
]

export default function ApplyHostPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd  = new FormData(e.currentTarget)
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
      router.push('/login?role=host&applied=1')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Split hero ──────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 min-h-screen">

        {/* Left — form panel */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 bg-gray-50">

          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <Link href="/" className="inline-block text-xl font-bold mb-8"
              style={{ color: 'var(--color-navy)' }}>
              Easy<span style={{ color: 'var(--color-primary)' }}>Drive</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              List your car on Easy Drive
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Earn $300–$450/week per vehicle renting to verified GTA gig drivers.
            </p>

            {/* Requirements card */}
            <div className="card p-5 mb-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Requirements</h2>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+1XXXXXXXXXX)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+14161234567"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Toronto"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of vehicles</label>
                  <input
                    type="number"
                    name="vehicle_count"
                    min={1}
                    max={20}
                    defaultValue={1}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
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

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
                style={{ minHeight: 48 }}>
                {submitting ? 'Submitting...' : 'Apply as a host'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Already have an account?{' '}
                <Link href="/login" className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right — image + earnings overlay (hidden on mobile) */}
        <div className="hidden md:block relative overflow-hidden" style={{ backgroundColor: 'var(--color-navy)' }}>
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
            alt="Car key handoff — host handing keys to a gig driver"
            fill
            className="object-cover object-center opacity-60"
            priority
            sizes="50vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {/* Earnings overlay card — bottom left */}
          <div className="absolute bottom-10 left-10 right-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">Earn $300–$450/week</div>
                  <div className="text-sm text-white/70">Per vehicle, on average</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { value: '80%', label: 'You keep' },
                  { value: '48 hr', label: 'Approval' },
                  { value: 'Weekly', label: 'Payouts' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white/10 rounded-xl py-3">
                    <div className="font-extrabold text-base">{value}</div>
                    <div className="text-xs text-white/60 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
