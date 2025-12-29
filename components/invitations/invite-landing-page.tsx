'use client'

import { AuthForm } from '@/components/auth/auth-form'

type InviteLandingPageProps =
  | { status: 'invalid'; token: string }
  | { status: 'expired'; token: string; groupName: string }
  | { status: 'error'; token: string; error: string }
  | {
      status: 'unauthenticated'
      token: string
      groupName: string
      inviterName: string
      expiresAt: string
    }

export function InviteLandingPage(props: InviteLandingPageProps) {
  if (props.status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 max-w-md text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Invalid Invite Link</h1>
          <p className="text-[var(--text-secondary)]">
            This invite link is invalid or has been revoked.
          </p>
        </div>
      </div>
    )
  }

  if (props.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 max-w-md text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Invite Link Expired</h1>
          <p className="text-[var(--text-secondary)]">
            This invite link to <strong className="text-white">{props.groupName}</strong> has
            expired. Ask the group creator for a new link.
          </p>
        </div>
      </div>
    )
  }

  if (props.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 max-w-md text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Could Not Join Group</h1>
          <p className="text-[var(--text-secondary)]">{props.error}</p>
        </div>
      </div>
    )
  }

  // status === 'unauthenticated'
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md">
        <img
          src="/logos/settle-logo.png"
          alt="Settle"
          className="mb-6 h-24 w-auto rounded-[16px]"
        />
        <div className="glass p-6 mb-6 text-center w-full">
          <p className="text-[var(--text-secondary)] text-sm mb-1">You&apos;ve been invited to</p>
          <h1 className="text-2xl font-bold text-white">{props.groupName}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Invited by {props.inviterName}
          </p>
        </div>
        <p className="text-[var(--text-secondary)] mb-6 text-center text-sm">
          Log in or create an account to join this group.
        </p>
        <AuthForm redirectTo={`/invite/${props.token}`} />
      </div>
    </div>
  )
}
