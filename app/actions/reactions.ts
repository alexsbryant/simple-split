'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ActionResult = {
  success: boolean
  error?: string
  added?: boolean // true if reaction was added, false if removed
}

/**
 * Toggle a reaction on an expense.
 * If user already has this emoji reaction, remove it.
 * If user doesn't have it, add it.
 */
export async function toggleReaction(
  expenseId: string,
  emoji: string,
  groupId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from('expense_reactions')
    .select('id')
    .eq('expense_id', expenseId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    // Remove existing reaction
    const { error } = await supabase
      .from('expense_reactions')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/groups/${groupId}`)
    return { success: true, added: false }
  } else {
    // Add new reaction
    const { error } = await supabase
      .from('expense_reactions')
      .insert({
        expense_id: expenseId,
        user_id: user.id,
        emoji: emoji,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/groups/${groupId}`)
    return { success: true, added: true }
  }
}
