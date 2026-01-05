import { createClient } from '@/lib/supabase-server'
import { SimpleSplitPage } from '@/components/split-page'
import { User, Group, Expense } from '@/types'
import { redirect } from 'next/navigation'
import { updateLastSeen } from '@/app/actions/groups'

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const { groupId } = await params
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    redirect('/')
  }

  // Verify user is a member of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', authUser.id)
    .single()

  if (!membership) {
    redirect('/groups')
  }

  // Update last_seen_at for unread indicator (fire-and-forget, doesn't block render)
  updateLastSeen(groupId)

  // Fetch current user from public.users
  const { data: currentUserData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const currentUser: User = {
    id: currentUserData.id,
    email: currentUserData.email,
    displayName: currentUserData.display_name,
  }

  // Fetch group
  const { data: groupData } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  // Fetch group members with user details
  const { data: membersData } = await supabase
    .from('group_members')
    .select('user_id, users(id, email, display_name)')
    .eq('group_id', groupId)

  // Fetch expenses for this group with splits
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*, expense_splits(id, user_id, amount)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  // Fetch pending invitations for this group
  const { data: invitationsData } = await supabase
    .from('group_invitations')
    .select('id, invited_email, invited_by_user_id, created_at')
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Determine if current user is the group creator
  const isCreator = groupData.created_by === authUser.id

  // Transform to match TypeScript types (snake_case → camelCase)
  const group: Group = {
    id: groupData.id,
    name: groupData.name,
    currency: groupData.currency ?? 'USD',
    createdAt: groupData.created_at,
  }

  const users: User[] = membersData?.map((m) => {
    const user = m.users as unknown as { id: string; email: string; display_name: string }
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    }
  }) ?? []

  // Find the creator's display name
  const creator = users.find(u => u.id === groupData.created_by)
  const creatorName = creator?.displayName ?? 'Unknown'

  const expenses: Expense[] = expensesData?.map((e: {
    id: string
    group_id: string
    paid_by_user_id: string
    amount: number
    description: string
    created_at: string
    updated_at: string
    is_settlement: boolean
    settled_with_user_id: string | null
    expense_splits?: Array<{ id: string; user_id: string; amount: number }>
  }) => ({
    id: e.id,
    groupId: e.group_id,
    paidByUserId: e.paid_by_user_id,
    amount: Number(e.amount),
    description: e.description ?? '',
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    isSettlement: e.is_settlement ?? false,
    settledWithUserId: e.settled_with_user_id ?? null,
    splits: e.expense_splits && e.expense_splits.length > 0
      ? e.expense_splits.map((s) => ({
          id: s.id,
          expenseId: e.id,
          userId: s.user_id,
          amount: Number(s.amount),
        }))
      : undefined,
  })) ?? []

  const pendingInvitations = invitationsData?.map((inv: {
    id: string
    invited_email: string
    invited_by_user_id: string
    created_at: string
  }) => ({
    id: inv.id,
    invitedEmail: inv.invited_email,
    invitedByUserId: inv.invited_by_user_id,
    createdAt: inv.created_at,
  })) ?? []

  return (
    <SimpleSplitPage
      currentUser={currentUser}
      group={group}
      users={users}
      initialExpenses={expenses}
      pendingInvitations={pendingInvitations}
      isCreator={isCreator}
      creatorName={creatorName}
    />
  )
}
