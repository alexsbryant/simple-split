'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ActionResult = {
  success: boolean
  error?: string
}

export async function deleteGroup(groupId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is the creator (RLS will also enforce this)
  const { data: group, error: fetchError } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (fetchError || !group) {
    return { success: false, error: 'Group not found' }
  }

  if (group.created_by !== user.id) {
    return { success: false, error: 'Only the group creator can delete this group' }
  }

  // Delete the group (cascades to group_members, expenses, invitations)
  const { error: deleteError } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath('/groups')
  return { success: true }
}

export async function updateGroupName(
  groupId: string,
  newName: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validate input
  const trimmedName = newName.trim()
  if (!trimmedName) {
    return { success: false, error: 'Group name cannot be empty' }
  }
  if (trimmedName.length > 100) {
    return { success: false, error: 'Group name must be 100 characters or less' }
  }

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is the creator (RLS will also enforce this)
  const { data: group, error: fetchError } = await supabase
    .from('groups')
    .select('created_by')
    .eq('id', groupId)
    .single()

  if (fetchError || !group) {
    return { success: false, error: 'Group not found' }
  }

  if (group.created_by !== user.id) {
    return { success: false, error: 'Only the group creator can rename this group' }
  }

  // Update the group name
  const { error: updateError } = await supabase
    .from('groups')
    .update({ name: trimmedName })
    .eq('id', groupId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function updateLastSeen(groupId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Update last_seen_at for this user's membership in this group
  const { error: updateError } = await supabase
    .from('group_members')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
