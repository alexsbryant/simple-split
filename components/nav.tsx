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
      <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/groups"
            className="text-lg font-semibold text-white font-[family-name:var(--font-bodoni)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Simple Split
          </Link>

          {isOnSplitPage && (
            <Link href="/groups">
              <Button variant="secondary" className="text-xs py-1.5 px-3">
                Back to Groups
              </Button>
            </Link>
          )}
        </div>

        <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </nav>
  )
}
