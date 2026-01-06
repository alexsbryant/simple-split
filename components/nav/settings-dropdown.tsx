'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-provider'
import { updateDisplayName } from '@/app/actions/user'

export function SettingsDropdown() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // User data state
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; displayName: string } | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userData } = await supabase
        .from('users')
        .select('id, email, display_name')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setCurrentUser({
          id: userData.id,
          email: userData.email,
          displayName: userData.display_name,
        })
        setDisplayName(userData.display_name)
      }
    }

    fetchUser()
  }, [])

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  // Handle display name save
  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateDisplayName(displayName)

    if (result.success) {
      setSuccess(true)
      setIsEditingName(false)
      if (currentUser) {
        setCurrentUser({ ...currentUser, displayName })
      }
      router.refresh()
      setTimeout(() => setSuccess(false), 2000)
    } else {
      setError(result.error || 'Failed to update')
    }

    setLoading(false)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setDisplayName(currentUser?.displayName || '')
    setIsEditingName(false)
    setError(null)
    setSuccess(false)
  }

  // Handle logout
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div>
      {/* Profile Section */}
      <button
        onClick={() => toggleSection('profile')}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${expandedSections.has('profile') ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expandedSections.has('profile') && currentUser && (
        <div className="px-4 py-3 bg-[var(--bg-card-elevated)] space-y-3">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Email</label>
            <p className="text-xs text-[var(--text-secondary)]">{currentUser.email}</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Display Name</label>
            {!isEditingName ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-[var(--text-secondary)]">{displayName}</p>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Edit display name"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value)
                    setError(null)
                    setSuccess(false)
                  }}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Your name"
                />
                {error && <p className="text-xs text-[var(--negative)]">{error}</p>}
                {success && <p className="text-xs text-[var(--positive)]">Updated!</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={loading || displayName.trim() === currentUser.displayName}
                    className="px-2 py-1 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-2 py-1 text-xs rounded border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appearance Section */}
      <button
        onClick={() => toggleSection('appearance')}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Appearance
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${expandedSections.has('appearance') ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expandedSections.has('appearance') && (
        <div className="px-3 py-3 bg-[var(--bg-card-elevated)]">
          <div className="flex gap-1">
            {/* Light mode */}
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 px-2 py-1.5 rounded border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--nav-button-hover)]'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-xs">Light</span>
              </div>
            </button>

            {/* Dark mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 px-2 py-1.5 rounded border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--nav-button-hover)]'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-xs">Dark</span>
              </div>
            </button>

            {/* System mode */}
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 px-2 py-1.5 rounded border transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--nav-button-hover)]'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">System</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Account Section */}
      <button
        onClick={() => toggleSection('account')}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Account
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${expandedSections.has('account') ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expandedSections.has('account') && (
        <div className="px-4 py-3 bg-[var(--bg-card-elevated)]">
          <p className="text-xs text-[var(--text-secondary)]">Coming soon...</p>
        </div>
      )}

      {/* Divider */}
      <div className="my-1 border-t border-[var(--border-default)]" />

      {/* Logout (non-expandable) */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </div>
  )
}
