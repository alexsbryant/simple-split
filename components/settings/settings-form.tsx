'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateDisplayName } from '@/app/actions/user'

interface SettingsFormProps {
  currentUser: User
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName)
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
      router.refresh()
    } else {
      setError(result.error || 'Failed to update display name')
    }

    setLoading(false)
  }

  const hasChanges = displayName.trim() !== currentUser.displayName

  return (
    <section className="glass p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Email
          </label>
          <p className="text-[var(--text-muted)]">{currentUser.email}</p>
        </div>

        <Input
          label="Display Name"
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value)
            setSuccess(false)
          }}
          placeholder="Your name"
        />

        {error && (
          <p className="text-sm text-[var(--negative)]">{error}</p>
        )}

        {success && (
          <p className="text-sm text-[var(--positive)]">Display name updated</p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading || !hasChanges}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </section>
  )
}
