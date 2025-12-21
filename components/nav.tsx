import Link from 'next/link'

export function Nav() {
  return (
    <nav className="border-b border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)] backdrop-blur-sm">
      <div className="max-w-[640px] mx-auto px-4 py-3">
        <Link
          href="/groups"
          className="text-lg font-semibold text-white font-[family-name:var(--font-bodoni)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Simple Split
        </Link>
      </div>
    </nav>
  )
}
