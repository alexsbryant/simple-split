'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { updateDisplayName } from '@/app/actions/user'
import { createClient } from '@/lib/supabase'

interface SettingsFormProps {
  currentUser: User
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setLoading(true)

    const result = await updateDisplayName(displayName)

    if (result.success) {
      setSuccess(true)
      setIsEditing(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update display name')
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setDisplayName(currentUser.displayName)
    setIsEditing(false)
    setError(null)
    setSuccess(false)
  }

  const hasChanges = displayName.trim() !== currentUser.displayName

  const handlePasswordSave = async () => {
    setPasswordError(null)
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) {
      setPasswordError(error.message)
      return
    }
    setPasswordSuccess(true)
    setIsEditingPassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const handlePasswordCancel = () => {
    setIsEditingPassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
  }

  return (
    <section className="glass p-6">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-title)' }}>Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Email
        </label>
        <p className="text-[var(--text-muted)]">{currentUser.email}</p>
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Display Name
        </label>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <p className="text-[var(--text-muted)]">{displayName}</p>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Edit display name"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setSuccess(false)
              }}
              placeholder="Your name"
              className="w-full px-5 py-3 glass-input transition-all duration-150"
            />
            {error && (
              <p className="text-sm text-[var(--negative)] mt-1">{error}</p>
            )}
            {success && (
              <p className="text-sm text-[var(--positive)] mt-1">Display name updated</p>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !hasChanges}
                className="text-xs py-1.5 px-4"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                className="text-xs py-1.5 px-4"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Password
        </label>
        {!isEditingPassword ? (
          <div className="flex items-center gap-2">
            <p className="text-[var(--text-muted)]">••••••••</p>
            <button
              type="button"
              onClick={() => setIsEditingPassword(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Change password"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            {passwordSuccess && (
              <p className="text-sm text-[var(--positive)]">Password updated</p>
            )}
          </div>
        ) : (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null) }}
              placeholder="New password"
              className="w-full px-5 py-3 glass-input transition-all duration-150 mb-2"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null) }}
              placeholder="Confirm new password"
              className="w-full px-5 py-3 glass-input transition-all duration-150"
            />
            {passwordError && (
              <p className="text-sm text-[var(--negative)] mt-1">{passwordError}</p>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handlePasswordSave}
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className="text-xs py-1.5 px-4"
              >
                {passwordLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePasswordCancel}
                disabled={passwordLoading}
                className="text-xs py-1.5 px-4"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
      </form>
    </section>
  )
}
