import Link from 'next/link'
import { CheckCircle, Car, Shield, MapPin, DollarSign, Clock, ChevronDown, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-navy">Easy<span className="text-primary">Drive</span></span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-gray-500 hover:text-gray-900">
              Sign in
            </Link>
            <Link href="/browse" className="btn-secondary text-sm px-4" style={{ minWidth: 'auto', minHeight: 38 }}>
              Find a car
            </Link>
            <Link href="/apply-host" className="btn-primary text-sm px-4" style={{ minWidth: 'auto', minHeight: 38 }}>
              List your car
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              P2P car marketplace — Greater Toronto Area
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Rent to gig drivers.<br />
              Earn while you sleep.
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Easy Drive connects GTA car owners with verified Uber Eats, DoorDash, and
              Skip drivers. Hosts earn 80% of every booking. Renters get insured,
              GPS-tracked cars — no long-term commitment.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col xs:flex-row gap-4">
              <div className="flex-1">
                <Link href="/apply-host"
                  className="btn-primary text-base px-6 py-3 w-full justify-center"
                  style={{ minWidth: 'auto', minHeight: 52, background: '#00C2D4' }}>
                  List your car
                </Link>
                <p className="text-xs text-blue-300 text-center mt-2">Car owners · Earn $300–$450/wk</p>
              </div>
              <div className="flex-1">
                <Link href="/browse"
                  className="btn-secondary text-base px-6 py-3 w-full justify-center border-white/20 text-white bg-white/10 hover:bg-white/20"
                  style={{ minWidth: 'auto', minHeight: 52 }}>
                  Find a car
                </Link>
                <p className="text-xs text-blue-300 text-center mt-2">Gig drivers · From $300/wk</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How the marketplace works ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">How Easy Drive works</h2>
          <p className="text-center text-gray-500 mb-12 text-sm">Two sides, one platform</p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* For Hosts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                  style={{ background: 'var(--color-primary)' }}>
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">For car owners (Hosts)</h3>
              </div>
              <ol className="space-y-3">
                {[
                  'List your vehicle — add photos, set your weekly rate, configure GPS',
                  'Get approved — we review insurance and hardware within 48 hours',
                  'Accept bookings — renters request, you confirm (or auto-accept)',
                  'Earn 80% — weekly payouts direct to your bank via Stripe',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--color-primary)' }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link href="/apply-host" className="btn-primary mt-5 inline-flex"
                style={{ minWidth: 'auto', minHeight: 42 }}>
                List a vehicle
              </Link>
            </div>

            {/* For Renters */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-navy">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">For gig drivers (Renters)</h3>
              </div>
              <ol className="space-y-3">
                {[
                  'Apply once — verify your licence, gig account, and identity',
                  'Browse listings — filter by city, price, and vehicle type',
                  'Request a booking — host confirms, you pay weekly + $500 deposit',
                  'Pick up and earn — GPS-tracked, insured, and ready to go',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link href="/apply-renter" className="btn-secondary mt-5 inline-flex"
                style={{ minWidth: 'auto', minHeight: 42 }}>
                Apply as a renter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Easy Drive?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified renters only',        desc: 'Every renter passes licence, identity, and gig account verification before they can book.' },
              { icon: MapPin, title: 'GPS + kill switch on every car', desc: 'Hosts and Easy Drive can locate and remotely disable any vehicle if needed.' },
              { icon: DollarSign, title: 'Hosts keep 80%',           desc: 'Platform fee is 20%. Weekly payouts go directly to your bank via Stripe.' },
              { icon: Car, title: 'Delivery-ready vehicles',          desc: 'Listings must be insured for commercial delivery use in Ontario.' },
              { icon: Clock, title: 'Weekly flexibility',             desc: 'No 12-month leases. Renters book week-to-week. Hosts can pause anytime.' },
              { icon: Users, title: 'Ontario-registered business',    desc: 'Operated by GB Trade and Logistics Inc. — fully incorporated in Ontario.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-primary-light)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1 text-sm">{title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How does the 80/20 split work?',
                a: 'Renters pay the host\'s weekly rate plus a 20% platform fee (collected by Easy Drive). Hosts receive 80% of the booking rate, paid weekly via Stripe direct deposit.',
              },
              {
                q: 'What insurance is required to list my car?',
                a: 'Your vehicle must have a valid commercial insurance policy that covers P2P car rental and delivery use in Ontario. You will upload the certificate during the listing process.',
              },
              {
                q: 'What GPS hardware is required?',
                a: 'Every listed vehicle must have a Bouncie GPS device installed. An optional PassTime kill switch module enables remote immobilization. Both device IDs must be entered during listing setup.',
              },
              {
                q: 'How does the $500 deposit work?',
                a: 'We hold $500 as a security deposit at booking confirmation (card authorisation only — not charged). It is released in full after a clean return, or partially captured if there is damage.',
              },
              {
                q: 'Who can rent a car on Easy Drive?',
                a: 'Ontario drivers with a valid G or G2 licence, an active gig platform account (Uber Eats, DoorDash, Skip, Instacart), and no suspended licence or 3+ at-fault accidents.',
              },
              {
                q: 'Can a host disable their own vehicle?',
                a: 'Yes. Hosts can disable the ignition remotely if there is an active booking and they have a valid reason. Re-enabling requires Easy Drive admin approval — this prevents abuse.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-medium text-gray-900 text-sm list-none">
                  {q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTAs ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-blue-200 mb-8">Car owners and gig drivers both welcome.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply-host" className="btn-primary text-base px-8 inline-flex justify-center"
              style={{ minHeight: 52, background: 'var(--color-primary)' }}>
              List your car as a host
            </Link>
            <Link href="/browse" className="btn-secondary text-base px-8 inline-flex justify-center border-white/20 text-white bg-white/10 hover:bg-white/20"
              style={{ minHeight: 52 }}>
              Browse available cars
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <span>© 2026 Easy Drive · A division of GB Trade and Logistics Inc.</span>
          <div className="flex gap-6">
            <Link href="/privacy"     className="hover:text-white">Privacy</Link>
            <Link href="/terms"       className="hover:text-white">Terms</Link>
            <Link href="/apply-host"  className="hover:text-white">List a car</Link>
            <Link href="/browse"      className="hover:text-white">Find a car</Link>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA bar ──────────────────────────────────────────── */}
      <div className="mobile-cta-bar">
        <Link href="/apply-host" className="btn-primary flex-1 justify-center text-sm" style={{ minWidth: 0 }}>
          List your car
        </Link>
        <Link href="/browse" className="btn-secondary flex-1 justify-center text-sm" style={{ minWidth: 0 }}>
          Find a car
        </Link>
      </div>
    </div>
  )
}
