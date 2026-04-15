'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {submitted ? (
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Check your email</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              If an account exists, a reset link has been sent.
            </p>
            <a
              href="/"
              className="block text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Back to login
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Reset your password</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm text-[var(--negative)] text-center">{error}</p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? '...' : 'Send reset link'}
              </Button>
            </form>

            <p className="text-center text-sm">
              <a
                href="/"
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Back to login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
