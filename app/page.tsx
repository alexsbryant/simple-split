import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl md:text-7xl font-semibold text-white font-[family-name:var(--font-bodoni)] mb-4">
          Simple Split
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-10">
          Split expenses with friends, simply.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/groups">
            <Button variant="primary" className="w-full sm:w-auto">
              Log in
            </Button>
          </Link>
          <Link href="/groups">
            <Button variant="secondary" className="w-full sm:w-auto">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
