'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelInvitation } from '@/app/actions/invitations'

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

type GroupInvitation = {
  id: string
  invitedEmail: string
  invitedByUserId: string
  createdAt: string
}

type GroupInvitationsListProps = {
  invitations: GroupInvitation[]
  groupId: string
  currentUserId: string
}

export function GroupInvitationsList({
  invitations,
  groupId,
  currentUserId,
}: GroupInvitationsListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (invitations.length === 0) {
    return null
  }

  const handleCancel = async (invitationId: string) => {
    setLoadingId(invitationId)
    setError(null)

    const result = await cancelInvitation(invitationId, groupId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to cancel invitation')
    }

    setLoadingId(null)
  }

  return (
    <div className="glass p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--text-secondary)]">
          <ClockIcon />
        </span>
        <h3 className="text-sm font-semibold text-white">
          Pending Invitations ({invitations.length})
        </h3>
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      <div className="space-y-2">
        {invitations.map(invitation => {
          const isOwner = invitation.invitedByUserId === currentUserId
          const date = new Date(invitation.createdAt)
          const formattedDate = `${date.getUTCDate()} ${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}`

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-white/10 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{invitation.invitedEmail}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Invited {formattedDate}
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleCancel(invitation.id)}
                  disabled={loadingId === invitation.id}
                  className="text-[var(--text-secondary)] hover:text-red-400 disabled:opacity-50 cursor-pointer p-1"
                  title="Cancel invitation"
                >
                  <XIcon />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
