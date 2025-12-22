import { createClient } from '@/lib/supabase-server'
import { SimpleSplitPage } from '@/components/split-page'
import { User, Group, Expense } from '@/types'
import { redirect } from 'next/navigation'

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const { groupId } = await params
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    redirect('/')
  }

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

  // Fetch expenses for this group
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  // Transform to match TypeScript types (snake_case → camelCase)
  const group: Group = {
    id: groupData.id,
    name: groupData.name,
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

  const expenses: Expense[] = expensesData?.map((e: {
    id: string
    group_id: string
    paid_by_user_id: string
    amount: number
    description: string
    created_at: string
    updated_at: string
  }) => ({
    id: e.id,
    groupId: e.group_id,
    paidByUserId: e.paid_by_user_id,
    amount: Number(e.amount),
    description: e.description ?? '',
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  })) ?? []

  return (
    <SimpleSplitPage
      currentUser={currentUser}
      group={group}
      users={users}
      initialExpenses={expenses}
    />
  )
}
