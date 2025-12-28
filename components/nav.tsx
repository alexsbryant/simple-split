'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const isOnSplitPage = pathname?.startsWith('/groups/') && pathname !== '/groups'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)] backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/groups"
            className="flex items-center gap-2 opacity-90 hover:opacity-75 transition-opacity"
          >
            <img
              src="/logos/settle-icon.png"
              alt="Settle"
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-2xl font-semibold text-white font-[family-name:var(--font-bodoni)]">
              Settle
            </span>
          </Link>

          {isOnSplitPage && (
            <Link href="/groups">
              <Button variant="secondary" className="text-xs py-1.5 px-3">
                Back to Groups
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="secondary" className="text-xs py-1.5 px-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </Link>
          <Button variant="secondary" className="text-xs py-1.5 px-3 flex items-center gap-1.5" onClick={handleLogout}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </Button>
        </div>
      </div>
    </nav>
  )
}
