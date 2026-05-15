import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Server-side Supabase client (anon key, respects RLS).
 * Use in React Server Components and API routes for user-scoped operations.
 * Auth is read from the Supabase SSR cookie session managed by middleware.
 */
export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // In RSC context, cookie setting is a no-op — middleware handles session refresh
          }
        },
      },
    }
  )
}

/**
 * Mobile API client — authenticates via Authorization: Bearer <access_token>.
 *
 * The Expo app cannot use cookies. Instead it sends the Supabase JWT in the
 * Authorization header of every API request. This helper extracts that token
 * and calls setSession so that RLS policies evaluate correctly server-side.
 *
 * Usage in an API route:
 *   const supabase = await createMobileClient(request.headers.get('Authorization'))
 *
 * Security note: setSession with an empty refresh_token is intentional here.
 * The mobile client refreshes tokens independently; the server only needs the
 * access token to verify the JWT and enforce RLS. Never log or store the token.
 */
export async function createMobileClient(authHeader: string | null) {
  const client = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    await client.auth.setSession({ access_token: token, refresh_token: '' })
  }

  return client
}

/**
 * Unified API client — works for both web (cookie session) and mobile (Bearer token).
 *
 * Tries the Authorization header first (mobile); if absent or not a Bearer token,
 * falls back to the cookie-based SSR client (web). This lets a single API route
 * handler serve both platforms without duplication.
 *
 * Usage in an API route:
 *   const supabase = await createApiClient(request)
 *   const { data: { session } } = await supabase.auth.getSession()
 */
export async function createApiClient(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    // Mobile path — JWT in Authorization header
    return createMobileClient(authHeader)
  }

  // Web path — cookie session managed by Supabase SSR middleware
  return createClient()
}

/**
 * Admin Supabase client — bypasses RLS.
 * ONLY use in server-side API routes for operations requiring elevated access.
 * Never expose the service role key to the browser.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Guard: resolves the current session or throws a 401 Response.
 * Use at the top of any API route that requires authentication.
 */
export async function requireSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return session
}

/**
 * Guard: resolves the session AND returns the caller's profile.
 * Throws 401 if unauthenticated, 404 if profile missing.
 */
export async function requireProfile() {
  const session = await requireSession()
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, host_status, renter_status, stripe_connect_account_id')
    .eq('auth_user_id', session.user.id)
    .single()

  if (!profile) throw new Response('Profile not found', { status: 404 })
  return { session, profile }
}

/**
 * Guard: verifies the caller is an admin.
 * Throws 403 if the role is not 'admin'.
 */
export async function requireAdminSession() {
  const session = await requireSession()
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 })
  }
  return session
}

/**
 * Guard: verifies the caller is an approved host.
 * Throws 403 if the role is not 'host' or host_status is not 'approved'.
 */
export async function requireApprovedHost() {
  const { session, profile } = await requireProfile()

  if (profile.role !== 'host') {
    throw new Response('Forbidden: host role required', { status: 403 })
  }
  if (profile.host_status !== 'approved') {
    throw new Response('Forbidden: host account not yet approved', { status: 403 })
  }
  return { session, profile }
}

/**
 * Guard: verifies the caller is an approved renter.
 * Throws 403 if the role is not 'renter' or renter_status is not 'approved'.
 */
export async function requireApprovedRenter() {
  const { session, profile } = await requireProfile()

  if (profile.role !== 'renter') {
    throw new Response('Forbidden: renter role required', { status: 403 })
  }
  if (profile.renter_status !== 'approved') {
    throw new Response('Forbidden: renter account not yet approved', { status: 403 })
  }
  return { session, profile }
}

/**
 * Guard: verifies the caller is either a host or an admin.
 * Used in routes that both roles can access (e.g. some alert routes).
 */
export async function requireHostOrAdmin() {
  const { session, profile } = await requireProfile()

  if (profile.role !== 'host' && profile.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 })
  }
  return { session, profile }
}
