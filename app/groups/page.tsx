import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { CreateGroupSection } from '@/components/groups/create-group-section'
import { PendingInvitationCard } from '@/components/invitations/pending-invitation-card'
import { createClient } from '@/lib/supabase-server'

export default async function GroupsPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Fetch user's email for invitation lookup
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  // Fetch pending invitations using helper function (bypasses RLS)
  const { data: invitationsData } = userData?.email
    ? await supabase.rpc('get_invitation_details', { user_email: userData.email })
    : { data: [] }

  type InvitationRow = {
    id: string
    group_id: string
    group_name: string
    inviter_name: string
    created_at: string
  }

  const pendingInvitations = (invitationsData as InvitationRow[] | null)?.map(inv => ({
    id: inv.id,
    groupName: inv.group_name,
    inviterName: inv.inviter_name,
    createdAt: inv.created_at,
  })) ?? []

  // Fetch group IDs where user is a member
  const { data: membershipData } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = membershipData?.map(m => m.group_id) ?? []

  // Fetch those groups with member counts
  const { data: groupsData } = groupIds.length > 0
    ? await supabase
        .from('groups')
        .select('id, name, group_members(count)')
        .in('id', groupIds)
        .order('created_at', { ascending: false })
    : { data: [] }

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

        {pendingInvitations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Pending Invitations ({pendingInvitations.length})
            </h2>
            <div className="space-y-3">
              {pendingInvitations.map(invitation => (
                <PendingInvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          </section>
        )}

        <CreateGroupSection userId={user.id} />

        {groups.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-2">
              You&apos;re not a member of any groups yet.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Groups will appear here once you create or join one.
            </p>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  )
}
