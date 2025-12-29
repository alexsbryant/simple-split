'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvitation } from '@/app/actions/invitations'

const UserPlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

type InviteFormProps = {
  groupId: string
}

type InviteButtonProps = {
  onClick: () => void
}

type InviteFormPanelProps = {
  groupId: string
  onClose: () => void
}

// Separate button component
export function InviteButton({ onClick }: InviteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn-secondary px-3 py-2 text-sm flex items-center gap-1 cursor-pointer"
    >
      <UserPlusIcon />
      Invite
    </button>
  )
}

// Separate form panel component
export function InviteFormPanel({ groupId, onClose }: InviteFormPanelProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await createInvitation(groupId, email)

    if (result.success) {
      setSuccess(true)
      setEmail('')
      router.refresh()
      // Auto-close after success
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } else {
      setError(result.error || 'Failed to send invitation')
    }

    setLoading(false)
  }

  const handleClose = () => {
    onClose()
    setEmail('')
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="glass p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Invite to Group</h3>
        <button
          onClick={handleClose}
          className="text-[var(--text-secondary)] hover:text-white cursor-pointer"
        >
          <XIcon />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
          disabled={loading}
          className="input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="btn-primary px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <SendIcon />
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400 mt-2">Invitation sent!</p>
      )}
    </div>
  )
}

// Original combined component for backwards compatibility
export function InviteForm({ groupId }: InviteFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return <InviteButton onClick={() => setIsOpen(true)} />
  }

  return <InviteFormPanel groupId={groupId} onClose={() => setIsOpen(false)} />
}
