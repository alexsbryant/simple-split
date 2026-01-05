'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type SplitInput = {
  userId: string
  amount: number
}

type ExpenseInput = {
  groupId: string
  paidByUserId: string
  amount: number
  description: string
  splits?: SplitInput[] // Optional custom splits
}

type ActionResult = {
  success: boolean
  error?: string
}

export async function createExpense(data: ExpenseInput): Promise<ActionResult> {
  const supabase = await createClient()

  // Validate splits if provided
  if (data.splits && data.splits.length > 0) {
    const splitTotal = data.splits.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(splitTotal - data.amount) > 0.01) {
      return {
        success: false,
        error: `Split total (${splitTotal.toFixed(2)}) must equal expense amount (${data.amount.toFixed(2)})`,
      }
    }
  }

  // Create expense and get the ID back
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      group_id: data.groupId,
      paid_by_user_id: data.paidByUserId,
      amount: data.amount,
      description: data.description,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Create splits if provided
  if (data.splits && data.splits.length > 0) {
    const splitsToInsert = data.splits.map((split) => ({
      expense_id: expense.id,
      user_id: split.userId,
      amount: split.amount,
    }))

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splitsToInsert)

    if (splitError) {
      // Rollback: delete the expense if splits failed
      await supabase.from('expenses').delete().eq('id', expense.id)
      return { success: false, error: `Failed to create splits: ${splitError.message}` }
    }
  }

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true }
}

export async function updateExpense(
  id: string,
  data: ExpenseInput
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validate splits if provided
  if (data.splits && data.splits.length > 0) {
    const splitTotal = data.splits.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(splitTotal - data.amount) > 0.01) {
      return {
        success: false,
        error: `Split total must equal expense amount`,
      }
    }
  }

  const { error } = await supabase
    .from('expenses')
    .update({
      paid_by_user_id: data.paidByUserId,
      amount: data.amount,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Delete existing splits for this expense
  await supabase.from('expense_splits').delete().eq('expense_id', id)

  // Create new splits if provided
  if (data.splits && data.splits.length > 0) {
    const splitsToInsert = data.splits.map((split) => ({
      expense_id: id,
      user_id: split.userId,
      amount: split.amount,
    }))

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splitsToInsert)

    if (splitError) {
      return { success: false, error: `Failed to update splits: ${splitError.message}` }
    }
  }

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true }
}

export async function deleteExpense(
  id: string,
  groupId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
