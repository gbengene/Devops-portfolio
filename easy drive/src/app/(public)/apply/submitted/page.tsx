import Link from 'next/link'

export default function ApplicationSubmitted() {
  const steps = [
    { label: 'Application submitted',          done: true },
    { label: 'We review your documents (24h)', done: false },
    { label: 'You receive our decision by SMS', done: false },
    { label: 'Sign rental agreement',          done: false },
    { label: 'Pick up your vehicle',           done: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Received!</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Thanks for applying. We'll review your application and contact you
            by SMS within 24 hours.
          </p>
        </div>

        {/* What happens next */}
        <div className="card text-left">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">What happens next</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  step.done
                    ? 'bg-green-500 text-white'
                    : i === 1
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
                style={i === 1 ? { background: 'var(--color-primary)' } : undefined}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${step.done || i === 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/1XXXXXXXXXX"
          className="btn-secondary w-full justify-center gap-2"
          style={{ minWidth: 0 }}
        >
          💬 Questions? WhatsApp us
        </a>

        <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
