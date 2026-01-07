'use server'

import { createClient } from '@/lib/supabase-server'

// Types
export type NotificationType =
  | 'expense_added'
  | 'expense_reacted'
  | 'expense_commented'
  | 'debt_settled'

export type Notification = {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string
  actorDisplayName: string
  groupId: string | null
  groupName: string | null
  expenseId: string | null
  expenseDescription: string | null
  metadata: { emoji?: string; amount?: number }
}

type NotificationsResult = {
  success: boolean
  error?: string
  notifications?: Notification[]
  unreadCount?: number
}

type ActionResult = {
  success: boolean
  error?: string
}

// ============================================
// Public Server Actions
// ============================================

/**
 * Fetch latest 20 notifications for current user
 */
export async function getNotifications(): Promise<NotificationsResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id,
      type,
      read_at,
      created_at,
      metadata,
      group_id,
      expense_id,
      actor:users!actor_user_id(display_name),
      group:groups(name),
      expense:expenses(description)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return { success: false, error: error.message }
  }

  const notifications: Notification[] = data.map((n) => {
    // Type helpers for Supabase join results
    const actor = n.actor as unknown as { display_name: string } | null
    const group = n.group as unknown as { name: string } | null
    const expense = n.expense as unknown as { description: string } | null

    return {
      id: n.id,
      type: n.type as NotificationType,
      read: n.read_at !== null,
      createdAt: n.created_at,
      actorDisplayName: actor?.display_name || 'Unknown',
      groupId: n.group_id,
      groupName: group?.name || null,
      expenseId: n.expense_id,
      expenseDescription: expense?.description || null,
      metadata: (n.metadata as { emoji?: string; amount?: number }) || {},
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return { success: true, notifications, unreadCount }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// Internal Notification Helpers
// (Called from other server actions)
// ============================================

/**
 * Notify all group members of a new expense (except the creator)
 */
export async function notifyExpenseAdded(
  expenseId: string,
  groupId: string,
  actorUserId: string
): Promise<void> {
  const supabase = await createClient()

  // Get all group members except the actor
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', actorUserId)

  if (!members || members.length === 0) return

  // Create notification for each member
  for (const member of members) {
    await supabase.rpc('create_notification', {
      p_user_id: member.user_id,
      p_actor_user_id: actorUserId,
      p_type: 'expense_added',
      p_group_id: groupId,
      p_expense_id: expenseId,
    })
  }
}

/**
 * Notify expense owner when someone reacts
 */
export async function notifyExpenseReacted(
  expenseId: string,
  actorUserId: string,
  emoji: string
): Promise<void> {
  const supabase = await createClient()

  // Get expense owner
  const { data: expense } = await supabase
    .from('expenses')
    .select('paid_by_user_id, group_id')
    .eq('id', expenseId)
    .single()

  if (!expense || expense.paid_by_user_id === actorUserId) return

  await supabase.rpc('create_notification', {
    p_user_id: expense.paid_by_user_id,
    p_actor_user_id: actorUserId,
    p_type: 'expense_reacted',
    p_group_id: expense.group_id,
    p_expense_id: expenseId,
    p_metadata: { emoji },
  })
}

/**
 * Notify expense owner when someone comments
 */
export async function notifyExpenseCommented(
  expenseId: string,
  actorUserId: string
): Promise<void> {
  const supabase = await createClient()

  // Get expense owner
  const { data: expense } = await supabase
    .from('expenses')
    .select('paid_by_user_id, group_id')
    .eq('id', expenseId)
    .single()

  if (!expense || expense.paid_by_user_id === actorUserId) return

  await supabase.rpc('create_notification', {
    p_user_id: expense.paid_by_user_id,
    p_actor_user_id: actorUserId,
    p_type: 'expense_commented',
    p_group_id: expense.group_id,
    p_expense_id: expenseId,
  })
}

/**
 * Notify the other party when a settlement is created
 */
export async function notifyDebtSettled(
  groupId: string,
  actorUserId: string,
  recipientUserId: string,
  amount: number
): Promise<void> {
  const supabase = await createClient()

  // Skip self-notification (handled by CHECK constraint too)
  if (actorUserId === recipientUserId) return

  await supabase.rpc('create_notification', {
    p_user_id: recipientUserId,
    p_actor_user_id: actorUserId,
    p_type: 'debt_settled',
    p_group_id: groupId,
    p_metadata: { amount },
  })
}
