'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // PKCE flow: exchange the one-time code for a session.
      // In dev (StrictMode), effects run twice — the second run will fail because
      // the code is already consumed. Fall back to getSession() to check if the
      // first run already established a valid session.
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (error) {
          const { data: { session } } = await supabase.auth.getSession()
          setSessionReady(session ? true : false)
        } else {
          setSessionReady(data.session ? true : false)
        }
      })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true)
        } else {
          setTimeout(() => {
            setSessionReady((current) => (current === null ? false : current))
          }, 2000)
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOutAndGoToLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    // Sign out so the user must log in with their new password
    await supabase.auth.signOut()
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 2000)
  }

  // Checking session
  if (sessionReady === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-[var(--text-muted)]">Verifying link...</p>
      </div>
    )
  }

  // Invalid or expired link
  if (sessionReady === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Link expired</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            This reset link is invalid or has expired.
          </p>
          <a
            href="/forgot-password"
            className="block text-sm text-[var(--accent)] hover:underline"
          >
            Request a new link
          </a>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Password updated</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Set a new password</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose a password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-[var(--negative)] text-center">{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? '...' : 'Update password'}
          </Button>
        </form>

        <p className="text-center text-sm">
          <button
            type="button"
            onClick={signOutAndGoToLogin}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  )
}
