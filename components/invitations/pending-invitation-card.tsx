'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvitation, declineInvitation } from '@/app/actions/invitations'

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

type PendingInvitationCardProps = {
  invitation: {
    id: string
    groupName: string
    inviterName: string
    createdAt: string
  }
}

export function PendingInvitationCard({ invitation }: PendingInvitationCardProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setLoadingAction('accept')
    setError(null)
    const result = await acceptInvitation(invitation.id)
    if (result.success && result.groupId) {
      router.push(`/groups/${result.groupId}`)
    } else {
      setError(result.error || 'Failed to accept invitation')
      setLoadingAction(null)
    }
  }

  const handleDecline = async () => {
    setLoadingAction('decline')
    setError(null)
    const result = await declineInvitation(invitation.id)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to decline invitation')
      setLoadingAction(null)
    }
  }

  const date = new Date(invitation.createdAt)
  const formattedDate = `${date.getUTCDate()} ${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}`

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{invitation.groupName}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Invited by {invitation.inviterName} on {formattedDate}
          </p>
          {error && (
            <p className="text-sm text-red-400 mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={loadingAction !== null}
            className="btn-primary px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            {loadingAction === 'accept' ? (
              'Accepting...'
            ) : (
              <>
                <CheckIcon />
                Accept
              </>
            )}
          </button>
          <button
            onClick={handleDecline}
            disabled={loadingAction !== null}
            className="btn-secondary px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            {loadingAction === 'decline' ? (
              'Declining...'
            ) : (
              <>
                <XIcon />
                Decline
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
