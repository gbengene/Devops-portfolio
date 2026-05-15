import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  DollarSign,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/host',           icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/host/listings',  icon: Car,             label: 'My Listings' },
  { href: '/host/bookings',  icon: CalendarDays,    label: 'Bookings'    },
  { href: '/host/earnings',  icon: DollarSign,      label: 'Earnings'    },
  { href: '/host/settings',  icon: Settings,        label: 'Settings'    },
] as const

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, host_status, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'host') redirect('/login')

  // Non-approved hosts are redirected to onboarding; middleware also enforces this.
  // We skip the redirect inside layout so the onboarding route itself can render.

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar (desktop) ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 flex-col flex-shrink-0"
        style={{ background: 'var(--color-navy)' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-xl font-bold text-white">
            Easy<span style={{ color: '#00C2D4' }}>Drive</span>
          </span>
          <p className="text-[10px] text-blue-300 mt-0.5 uppercase tracking-wider">Host Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="sidebar-link group"
              prefetch={false}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="px-4 py-2">
            <p className="text-xs text-blue-300 truncate">{profile.full_name}</p>
            <p className="text-[10px] text-blue-400">
              {profile.host_status === 'approved' ? 'Host' : 'Host (pending)'}
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="sidebar-link w-full">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* ── Bottom nav (mobile) ───────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.slice(0, 4).map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-gray-400 hover:text-primary transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
