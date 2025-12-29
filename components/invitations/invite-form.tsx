'use client'

import { useState, useEffect } from 'react'
import { getOrCreateInviteLink } from '@/app/actions/invitations'

const UserPlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
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

// Separate form panel component with tabbed interface
export function InviteFormPanel({ groupId, onClose }: InviteFormPanelProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'email'>('link')

  // Link tab state
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // Email tab state
  const [email, setEmail] = useState('')

  // Shared state
  const [error, setError] = useState<string | null>(null)

  // Generate invite link on mount and detect Web Share API support
  useEffect(() => {
    handleGenerateLink()
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleGenerateLink = async () => {
    setLinkLoading(true)
    setError(null)

    const result = await getOrCreateInviteLink(groupId)

    if (result.success && result.token) {
      const baseUrl = window.location.origin
      setInviteLink(`${baseUrl}/invite/${result.token}`)
      setLinkExpiresAt(result.expiresAt || null)
    } else {
      setError(result.error || 'Failed to generate invite link')
    }

    setLinkLoading(false)
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return

    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!inviteLink) return

    try {
      await navigator.share({
        title: 'Join my group on Settle',
        text: "I'd like you to join my expense-sharing group on Settle.",
        url: inviteLink,
      })
    } catch (err) {
      // User cancelled or share failed - fall back to copy if not AbortError
      if ((err as Error).name !== 'AbortError') {
        handleCopyLink()
      }
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteLink || !email.trim()) return

    const subject = encodeURIComponent('Join my group on Settle')
    const body = encodeURIComponent(
      `Hi!\n\nI'd like you to join my expense-sharing group on Settle.\n\nClick here to join: ${inviteLink}\n\nThis link expires in 7 days.`
    )

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    setEmail('')
  }

  const handleClose = () => {
    onClose()
    setEmail('')
    setError(null)
  }

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="glass p-4 mb-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Invite to Group</h3>
        <button
          onClick={handleClose}
          className="text-[var(--text-secondary)] hover:text-white cursor-pointer"
        >
          <XIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-lg">
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'link'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <LinkIcon />
          Link
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'email'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <MailIcon />
          Email
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {/* Link Tab */}
      {activeTab === 'link' && (
        <div className="space-y-3">
          {linkLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Generating link...</p>
          ) : inviteLink ? (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="input flex-1 text-sm truncate"
                />
                {canShare ? (
                  <button
                    onClick={handleShare}
                    className="btn-primary px-3 py-2 text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <ShareIcon />
                    Share
                  </button>
                ) : (
                  <button
                    onClick={handleCopyLink}
                    className="btn-primary px-3 py-2 text-sm flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              {linkExpiresAt && (
                <p className="text-xs text-[var(--text-muted)]">
                  Expires {formatExpiryDate(linkExpiresAt)}
                </p>
              )}
            </>
          ) : (
            <button onClick={handleGenerateLink} className="btn-primary w-full py-2 text-sm">
              Generate Invite Link
            </button>
          )}
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
            className="input w-full text-sm"
          />
          <button
            type="submit"
            disabled={!email.trim() || !inviteLink}
            className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <MailIcon />
            Send via Email
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            Opens your email app with a pre-filled invite message
          </p>
        </form>
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
