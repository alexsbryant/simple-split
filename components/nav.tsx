'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Determine active page
  const isOnGroupsPage = pathname === '/groups'
  const isOnSettingsPage = pathname === '/settings'

  const handleLogout = async () => {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <nav className="border-b-[0.5px] border-[var(--border-default)] bg-[var(--bg-nav)]">
      <div className="max-w-full mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/groups"
          className="flex items-center gap-2 opacity-90 hover:opacity-75 transition-opacity"
        >
          <img
            src="/logos/settle-logo-v2.png"
            alt="Settle"
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-title)' }}>
            Settle
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/groups">
            <button
              className={`
                text-xs py-1.5 px-3 rounded-full font-semibold uppercase tracking-wider
                flex items-center gap-1.5 transition-all duration-150
                ${isOnGroupsPage
                  ? 'bg-[var(--nav-button-active)] text-[var(--text-primary)]'
                  : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)]'
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groups
            </button>
          </Link>
          <Link href="/settings">
            <button
              className={`
                text-xs py-1.5 px-3 rounded-full font-semibold uppercase tracking-wider
                flex items-center gap-1.5 transition-all duration-150
                ${isOnSettingsPage
                  ? 'bg-[var(--nav-button-active)] text-[var(--text-primary)]'
                  : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)]'
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs py-1.5 px-3 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150 bg-transparent text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>

        {/* Mobile hamburger menu */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-10.5 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg py-2 z-50">
              <Link
                href="/groups"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-1.75 text-sm transition-colors ${
                  isOnGroupsPage
                    ? 'bg-[var(--nav-button-active)] text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Groups
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-1.75 text-sm transition-colors ${
                  isOnSettingsPage
                    ? 'bg-[var(--nav-button-active)] text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-1.75 text-sm text-[var(--text-primary)] hover:bg-[var(--nav-button-hover)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
