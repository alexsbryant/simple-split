'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { ExpenseComment } from '@/types'

type ActionResult = {
  success: boolean
  error?: string
}

type CommentResult = ActionResult & {
  comment?: ExpenseComment
}

export async function addComment(
  expenseId: string,
  content: string,
  groupId: string
): Promise<CommentResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate content
  const trimmedContent = content.trim()
  if (!trimmedContent) {
    return { success: false, error: 'Comment cannot be empty' }
  }
  if (trimmedContent.length > 500) {
    return { success: false, error: 'Comment must be 500 characters or less' }
  }

  const { data, error } = await supabase
    .from('expense_comments')
    .insert({
      expense_id: expenseId,
      user_id: user.id,
      content: trimmedContent,
    })
    .select('id, user_id, content, created_at')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return {
    success: true,
    comment: {
      id: data.id,
      expenseId: expenseId,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at,
    }
  }
}

export async function deleteComment(
  commentId: string,
  groupId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expense_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

/**
 * Fetch comments for a specific expense.
 * Called when expanding the comment section.
 */
export async function getExpenseComments(
  expenseId: string
): Promise<{ comments: ExpenseComment[], error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expense_comments')
    .select('id, user_id, content, created_at')
    .eq('expense_id', expenseId)
    .order('created_at', { ascending: true })

  if (error) {
    return { comments: [], error: error.message }
  }

  return {
    comments: data.map(c => ({
      id: c.id,
      expenseId: expenseId,
      userId: c.user_id,
      content: c.content,
      createdAt: c.created_at,
    }))
  }
}
