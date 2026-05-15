'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Global error boundary.
 * Catches unhandled errors in the React tree and shows a user-friendly fallback.
 * In production, the actual error message is hidden from users for security.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In production, send to an error tracking service (e.g. Sentry)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        An unexpected error occurred. If this keeps happening, please contact us on WhatsApp.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs bg-red-50 border border-red-200 rounded p-3 mb-4 max-w-lg text-left overflow-auto text-red-800">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary" style={{ minWidth: 'auto' }}>
          Try again
        </button>
        <Link href="/" className="btn-secondary" style={{ minWidth: 'auto' }}>
          Go home
        </Link>
      </div>
    </div>
  )
}
