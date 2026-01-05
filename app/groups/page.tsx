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

  // Fetch groups sorted by recent activity (RLS handles membership filtering)
  const { data: groupsData } = await supabase.rpc('get_user_groups_with_activity')

  type GroupRow = {
    id: string
    name: string
    created_by: string
    created_at: string
    member_count: number
    creator_display_name: string | null
    creator_email: string | null
    last_activity: string
    last_seen_at: string | null
  }

  const groups = (groupsData as GroupRow[] | null)?.map((g) => {
    const lastActivity = new Date(g.last_activity).getTime()
    const lastSeenAt = g.last_seen_at ? new Date(g.last_seen_at).getTime() : 0
    return {
      id: g.id,
      name: g.name,
      createdBy: g.created_by,
      creatorName: g.creator_display_name || g.creator_email || 'Unknown',
      memberCount: g.member_count,
      hasUnread: lastActivity > lastSeenAt,
    }
  }) ?? []

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-title)' }}>
            Your Groups
          </h1>
        </header>

        {pendingInvitations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-title)' }}>
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
                className="glass p-4 block transition-all duration-150 hover:bg-[var(--group-hover)] hover:border-[rgba(255,255,255,0.25)]"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text-title)' }}>
                  {group.name}
                  {group.hasUnread && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" aria-label="New activity" />
                  )}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {group.createdBy !== user.id && `Created by ${group.creatorName} · `}
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
