'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { updateDisplayName } from '@/app/actions/user'

interface SettingsFormProps {
  currentUser: User
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
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
      </form>
    </section>
  )
}
