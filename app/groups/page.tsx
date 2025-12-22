import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/nav'
import { createClient } from '@/lib/supabase-server'

export default async function GroupsPage() {
  const supabase = await createClient()

  // Fetch all groups with member counts
  const { data: groupsData } = await supabase
    .from('groups')
    .select('id, name, group_members(count)')
    .order('created_at', { ascending: false })

  const groups = groupsData?.map((g: { id: string; name: string; group_members: { count: number }[] }) => ({
    id: g.id,
    name: g.name,
    memberCount: g.group_members[0]?.count ?? 0,
  })) ?? []

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
          {groups.map(group => (
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
