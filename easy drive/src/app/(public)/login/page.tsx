'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Mode = 'magic_link' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode]         = useState<Mode>('magic_link')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true); setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Email and password are required.'); return }
    setLoading(true); setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    })

    if (error) { setError(error.message); setLoading(false); return }

    // Redirect based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', data.user.id)
      .single()

    router.push(profile?.role === 'admin' ? '/admin' : '/portal')
    router.refresh()
  }

  if (sent) {
    return (
      <LoginShell>
        <div className="text-center py-4">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500">
            We sent a sign-in link to <strong>{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-6 text-sm text-primary hover:underline"
          >
            Use a different email
          </button>
        </div>
      </LoginShell>
    )
  }

  return (
    <LoginShell>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in to Easy Drive</h1>
      <p className="text-sm text-gray-500 mb-6">
        {mode === 'magic_link'
          ? 'We\'ll email you a sign-in link — no password needed.'
          : 'Sign in with your email and password.'}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-5">
        <button
          onClick={() => { setMode('magic_link'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'magic_link' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Email link
        </button>
        <button
          onClick={() => { setMode('password'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'password' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Password
        </button>
      </div>

      {error && (
        <div className="alert-critical mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={mode === 'magic_link' ? handleMagicLink : handlePassword}
        className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            placeholder="you@email.com"
            className="input"
            required
          />
        </div>

        {mode === 'password' && (
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              className="input"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
          style={{ minWidth: 0 }}
        >
          {loading
            ? 'Loading…'
            : mode === 'magic_link' ? 'Send sign-in link' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        New driver?{' '}
        <Link href="/apply" className="text-primary hover:underline font-medium">
          Apply to rent
        </Link>
      </p>
    </LoginShell>
  )
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-2xl font-bold text-navy">
        Easy<span className="text-primary">Drive</span>
      </Link>
      <div className="w-full max-w-sm card shadow-card-hover">
        {children}
      </div>
    </div>
  )
}
