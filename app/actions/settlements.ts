'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { notifyDebtSettled } from './notifications'

type SettlementInput = {
  groupId: string
  payerUserId: string
  recipientUserId: string
  amount: number
}

type ActionResult = {
  success: boolean
  error?: string
}

/**
 * Create a settlement expense
 *
 * A settlement represents a real-world payment from payer to recipient.
 * Either party (payer or recipient) can mark as settled.
 */
export async function createSettlement(
  data: SettlementInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify current user is involved in the settlement
  if (authUser.id !== data.payerUserId && authUser.id !== data.recipientUserId) {
    return { success: false, error: 'You must be involved in this settlement' }
  }

  // Validate payer != recipient
  if (data.payerUserId === data.recipientUserId) {
    return { success: false, error: 'Cannot settle with yourself' }
  }

  // Validate amount
  if (data.amount <= 0) {
    return { success: false, error: 'Amount must be positive' }
  }

  // Verify both users are members of the group
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', data.groupId)
    .in('user_id', [data.payerUserId, data.recipientUserId])

  if (!members || members.length !== 2) {
    return { success: false, error: 'Both users must be group members' }
  }

  // Get user names for description
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name')
    .in('id', [data.payerUserId, data.recipientUserId])

  const payerName =
    users?.find((u) => u.id === data.payerUserId)?.display_name ?? 'Unknown'
  const recipientName =
    users?.find((u) => u.id === data.recipientUserId)?.display_name ?? 'Unknown'

  // Create settlement expense
  const { error } = await supabase.from('expenses').insert({
    group_id: data.groupId,
    paid_by_user_id: data.payerUserId,
    settled_with_user_id: data.recipientUserId,
    amount: data.amount,
    description: `Settlement: ${payerName} paid ${recipientName}`,
    is_settlement: true,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Notify the other party (the one who didn't initiate)
  const otherPartyId =
    authUser.id === data.payerUserId ? data.recipientUserId : data.payerUserId
  await notifyDebtSettled(data.groupId, authUser.id, otherPartyId, data.amount)

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true }
}
