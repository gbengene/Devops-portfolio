import Link from 'next/link'
import Image from 'next/image'
import { Shield, MapPin, DollarSign, Car, Clock, Users, ChevronDown } from 'lucide-react'
import { colors } from '@/lib/theme'

/* ── Data ───────────────────────────────────────────────────────────────────── */

const counters = [
  { number: '500+', label: 'Drivers served' },
  { number: '120+', label: 'Cars listed' },
  { number: '$340', label: 'Avg weekly host earnings' },
  { number: '48 hr', label: 'Approval time' },
]

const testimonials = [
  {
    quote:
      "I listed my old Corolla and made $1,100 last month while it sat in my driveway. Easiest income I've ever had.",
    name: 'Maria T.',
    city: 'Scarborough',
    role: 'Host',
    initials: 'MT',
  },
  {
    quote:
      "No credit check, no long lease. I picked up the car Tuesday and was delivering by Wednesday. That's how it should work.",
    name: 'Kwame A.',
    city: 'Brampton',
    role: 'Renter',
    initials: 'KA',
  },
  {
    quote:
      "The GPS and kill switch give me peace of mind. I don't worry about my car anymore.",
    name: 'Amir S.',
    city: 'Mississauga',
    role: 'Host',
    initials: 'AS',
  },
]

const whyItems = [
  { icon: Shield, title: 'Verified renters only', desc: 'Licence, identity, and gig account checks before every booking.' },
  { icon: MapPin, title: 'GPS + kill switch', desc: 'Real-time tracking and remote disable on every vehicle.' },
  { icon: DollarSign, title: 'Hosts keep 80%', desc: 'Weekly payouts to your bank. No hidden deductions.' },
  { icon: Car, title: 'Delivery-ready', desc: 'Every listing carries commercial insurance for Ontario delivery work.' },
  { icon: Clock, title: 'Week-to-week flex', desc: 'No 12-month leases. Renters book weekly, hosts pause anytime.' },
  { icon: Users, title: 'Ontario registered', desc: 'Operated by GB Trade and Logistics Inc. — fully incorporated.' },
]

const platforms = ['Uber Eats', 'DoorDash', 'SkipTheDishes', 'Instacart']

const howItWorksSteps = [
  { step: '01', title: 'List or apply', desc: 'Hosts add photos, rates, and GPS hardware. Renters verify their licence and gig account.' },
  { step: '02', title: '48-hour approval', desc: 'Our team reviews every submission and responds within two business days.' },
  { step: '03', title: 'Book & confirm', desc: 'Renters request a vehicle. Hosts confirm and the week begins.' },
  { step: '04', title: 'Earn every week', desc: 'Hosts receive 80% of the booking rate. Renters drive and earn on their chosen platform.' },
]

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight">
            Easy<span style={{ color: colors.brand.accent }}>Drive</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/browse"
              className="text-sm font-semibold px-4 py-2 rounded-full border border-white/25 text-white hover:border-white/60 transition-colors"
            >
              Find a car
            </Link>
            <Link
              href="/apply-host"
              className="text-sm font-semibold px-4 py-2 rounded-full text-black transition-colors"
              style={{ backgroundColor: colors.brand.accent }}
            >
              List your car
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=85"
          alt="Night highway with city lights — cinematic driving shot"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-8 border"
            style={{
              borderColor: colors.border.accent,
              color: colors.brand.accent,
              backgroundColor: 'rgba(0,194,212,0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: colors.brand.accent }}
            />
            Greater Toronto Area — P2P Car Marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight text-white mb-6">
            Your car.<br />
            <span style={{ color: colors.brand.accent }}>Their ride.</span><br />
            Everyone wins.
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Easy Drive connects GTA car owners with verified gig drivers.
            Hosts earn $300–$450/wk. Renters get GPS-tracked cars with no long lease.
          </p>

          {/* Pill CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply-host"
              className="text-base font-bold px-10 py-4 rounded-full text-black transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: colors.brand.accent, minHeight: 56 }}
            >
              List your car
            </Link>
            <Link
              href="/browse"
              className="text-base font-bold px-10 py-4 rounded-full text-white border-2 transition-all hover:bg-white/10"
              style={{ borderColor: colors.brand.accent, minHeight: 56 }}
            >
              Find a car
            </Link>
          </div>

          {/* Platform pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-white/40 mr-1">Accepted on</span>
            {platforms.map((p) => (
              <span
                key={p}
                className="text-xs font-medium px-3 py-1 rounded-full border border-white/20 text-white/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── Counter strip ───────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/10" style={{ backgroundColor: colors.surface.dark2 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {counters.map(({ number, label }) => (
              <div key={label}>
                <div
                  className="text-5xl md:text-6xl font-black mb-2 tabular-nums"
                  style={{ color: colors.brand.accent }}
                >
                  {number}
                </div>
                <div className="text-sm text-white/50 uppercase tracking-wide font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two-column: photo left, how-it-works right ───────────────────────── */}
      <section className="py-0 overflow-hidden" style={{ backgroundColor: colors.surface.dark3 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2">

          {/* Left: full-height photo */}
          <div className="relative min-h-[500px] md:min-h-[640px]">
            <Image
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=85"
              alt="Gig driver standing next to their car on a GTA street"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
          </div>

          {/* Right: how it works */}
          <div className="px-10 py-16 flex flex-col justify-center" style={{ backgroundColor: colors.surface.dark4 }}>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: colors.brand.accent }}
            >
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-10 leading-tight">
              From listing to earning<br />in 48 hours.
            </h2>

            <div className="space-y-8">
              {howItWorksSteps.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-5">
                  <div
                    className="text-3xl font-black tabular-nums flex-shrink-0 leading-none mt-1"
                    style={{ color: 'rgba(0,194,212,0.25)' }}
                  >
                    {step}
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">{title}</div>
                    <div className="text-sm text-white/50 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-10">
              <Link
                href="/apply-host"
                className="text-sm font-bold px-6 py-3 rounded-full text-black"
                style={{ backgroundColor: colors.brand.accent }}
              >
                List your car
              </Link>
              <Link
                href="/browse"
                className="text-sm font-bold px-6 py-3 rounded-full text-white border border-white/25 hover:border-white/50 transition-colors"
              >
                Find a car
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: colors.surface.dark2 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
            style={{ color: colors.brand.accent }}
          >
            What our community says
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12">
            Real people. Real income.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, city, role, initials }) => (
              <div
                key={name}
                className="p-6 rounded-2xl border flex flex-col gap-5"
                style={{ backgroundColor: colors.surface.dark5, borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">&#9733;</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/75 text-sm leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: colors.brand.accent, color: colors.text.onAccent }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-white/40">{city} &middot; {role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Easy Drive ──────────────────────────────────────────────────── */}
      <section className="py-20 border-y border-white/10" style={{ backgroundColor: colors.surface.dark3 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
            style={{ color: colors.brand.accent }}
          >
            Built different
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12">
            Why Easy Drive?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {whyItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(0,194,212,0.12)',
                    border: '1px solid rgba(0,194,212,0.2)',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: colors.brand.accent }} />
                </div>
                <div>
                  <div className="font-bold text-white mb-1 text-sm">{title}</div>
                  <div className="text-sm text-white/45 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bold full-width CTA ──────────────────────────────────────────────── */}
      <section
        className="py-24 text-center relative overflow-hidden"
        style={{ backgroundColor: colors.surface.dark1 }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,194,212,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            Your car. Their ride.<br />
            <span style={{ color: colors.brand.accent }}>Everyone wins.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of GTA hosts and drivers already on the platform.
            Get started in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply-host"
              className="text-base font-black px-10 py-4 rounded-full text-black hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.brand.accent, minHeight: 56 }}
            >
              List your car — it&apos;s free
            </Link>
            <Link
              href="/browse"
              className="text-base font-bold px-10 py-4 rounded-full text-white border-2 hover:bg-white/10 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.25)', minHeight: 56 }}
            >
              Browse available cars
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10" style={{ backgroundColor: colors.surface.dark2 }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/35">
          <div>
            <span className="font-black text-white text-lg">
              Easy<span style={{ color: colors.brand.accent }}>Drive</span>
            </span>
            <p className="text-xs mt-1 text-white/30">
              A division of GB Trade and Logistics Inc. &copy; 2026
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/apply-host" className="hover:text-white transition-colors">List a car</Link>
            <Link href="/browse" className="hover:text-white transition-colors">Find a car</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA bar ────────────────────────────────────────────── */}
      <div
        className="mobile-cta-bar"
        style={{ backgroundColor: colors.surface.dark2, borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <Link
          href="/apply-host"
          className="flex-1 text-center text-sm font-bold py-3 rounded-full text-black"
          style={{ backgroundColor: colors.brand.accent }}
        >
          List your car
        </Link>
        <Link
          href="/browse"
          className="flex-1 text-center text-sm font-bold py-3 rounded-full text-white border border-white/25"
        >
          Find a car
        </Link>
      </div>

    </div>
  )
}
