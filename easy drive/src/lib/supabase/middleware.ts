import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Called from root middleware.ts to refresh the Supabase session on every request.
 * Enforces route-level auth guards for three roles: admin | host | renter.
 *
 * Route rules:
 *   /admin/*          → role = 'admin'
 *   /host/*           → role = 'host' AND host_status = 'approved'
 *   /renter/* or
 *   /portal/*         → role = 'renter' AND renter_status = 'approved'
 *   /host/onboarding  → role = 'host' (any status — needed for Stripe KYC return)
 *   Public routes     → no auth required
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Gracefully handle auth errors (e.g. placeholder credentials in local dev)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Auth unavailable — allow public routes, guard protected routes below
  }

  const { pathname } = request.nextUrl

  // ── Admin routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        // Route to the right portal based on role
        const dest = profile?.role === 'host' ? '/host' : '/renter'
        return NextResponse.redirect(new URL(dest, request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Host routes ───────────────────────────────────────────────────────────────
  if (pathname.startsWith('/host')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, host_status')
        .eq('auth_user_id', user.id)
        .single()

      if (profile?.role !== 'host') {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Onboarding pages are accessible regardless of approval status
      const isOnboardingRoute = pathname.startsWith('/host/onboarding')
      if (!isOnboardingRoute && profile.host_status !== 'approved') {
        return NextResponse.redirect(new URL('/host/onboarding', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Renter routes (/renter/* and legacy /portal/*) ────────────────────────────
  if (pathname.startsWith('/renter') || pathname.startsWith('/portal')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, renter_status')
        .eq('auth_user_id', user.id)
        .single()

      // Admin visits /portal → redirect to admin dashboard
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      if (profile?.role !== 'renter') {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      if (profile.renter_status !== 'approved') {
        // Renter applied but not yet approved — show pending screen
        return NextResponse.redirect(new URL('/apply/submitted', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}
