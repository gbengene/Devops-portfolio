'use client'

import { useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'

export default function HostOnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleStartOnboarding() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/host/stripe-connect/onboard', { method: 'POST' })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      // Redirect to Stripe KYC flow
      window.location.href = json.url
    } catch {
      setError('Network error. Please check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--color-primary-light)' }}>
          <ExternalLink className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Set up your payouts</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Easy Drive uses Stripe to send your weekly rental earnings directly to your
          bank account. This takes about 5 minutes and is required before your listings
          can go live.
        </p>

        <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">&#10003;</span>
            Connect your Canadian bank account
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">&#10003;</span>
            Verify your identity (government ID)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">&#10003;</span>
            Receive 80% of each weekly booking automatically
          </li>
        </ul>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleStartOnboarding}
          disabled={loading}
          className="btn-primary w-full justify-center"
          style={{ minHeight: 48 }}
        >
          {loading ? 'Redirecting to Stripe...' : 'Connect bank account via Stripe'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Secured by Stripe. Easy Drive never stores your banking details.
        </p>
      </div>
    </div>
  )
}
