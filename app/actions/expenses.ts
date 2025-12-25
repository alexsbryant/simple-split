'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ExpenseInput = {
  groupId: string
  paidByUserId: string
  amount: number
  description: string
}

type ActionResult = {
  success: boolean
  error?: string
}

export async function createExpense(data: ExpenseInput): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('expenses').insert({
    group_id: data.groupId,
    paid_by_user_id: data.paidByUserId,
    amount: data.amount,
    description: data.description,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/groups/${data.groupId}`)
  return { success: true }
}

export async function updateExpense(
  id: string,
  data: ExpenseInput
): Promise<ActionResult> {
  const supabase = await createClient()

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
