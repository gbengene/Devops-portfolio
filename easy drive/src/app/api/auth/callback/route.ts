import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/callback
 * Handles the magic-link redirect from Supabase Auth.
 * Exchanges the code for a session then routes user to the correct dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Determine destination by role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', data.user.id)
    .single()

  const destination = profile?.role === 'admin' ? '/admin' : '/portal'
  return NextResponse.redirect(`${origin}${destination}`)
}
