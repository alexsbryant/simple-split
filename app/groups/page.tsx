import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/nav'

const MOCK_GROUPS = [
  { id: 'group-1', name: 'Household', memberCount: 2 },
  { id: 'group-2', name: 'Vacation Trip', memberCount: 4 },
]

export default function GroupsPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-white font-[family-name:var(--font-bodoni)]">
            Your Groups
          </h1>
        </header>

        <div className="mb-6">
          <Button variant="primary">Create new group</Button>
        </div>

        <div className="space-y-4">
          {MOCK_GROUPS.map(group => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="glass p-4 block transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
            >
              <h3 className="font-semibold text-white text-lg">{group.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
