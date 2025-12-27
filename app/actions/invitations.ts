'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ActionResult = {
  success: boolean
  error?: string
}

type AcceptResult = ActionResult & {
  groupId?: string
}

export async function createInvitation(
  groupId: string,
  email: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate email
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' }
  }

  // Check if invited user exists (using helper function to bypass RLS)
  const { data: invitedUser, error: userError } = await supabase
    .rpc('check_user_email_exists', { check_email: trimmedEmail })
    .single()

  if (userError || !invitedUser) {
    return { success: false, error: 'User not found. Ask them to sign up first.' }
  }

  const invitedUserId = (invitedUser as { user_id: string }).user_id

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', invitedUserId)
    .single()

  if (existingMember) {
    return { success: false, error: 'User is already a member of this group.' }
  }

  // Check if pending invitation already exists
  const { data: existingInvite } = await supabase
    .from('group_invitations')
    .select('id')
    .eq('group_id', groupId)
    .eq('invited_email', trimmedEmail)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { success: false, error: 'Invitation already sent to this email.' }
  }

  // Create invitation
  const { error: insertError } = await supabase.from('group_invitations').insert({
    group_id: groupId,
    invited_by_user_id: user.id,
    invited_email: trimmedEmail,
    status: 'pending',
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function acceptInvitation(invitationId: string): Promise<AcceptResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user's email from users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  if (userDataError || !userData) {
    return { success: false, error: 'Could not find user data' }
  }

  // Fetch invitation and verify it's for this user
  const { data: invitation, error: inviteError } = await supabase
    .from('group_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invitation) {
    return { success: false, error: 'Invitation not found or already responded' }
  }

  if (invitation.invited_email !== userData.email) {
    return { success: false, error: 'This invitation is not for you' }
  }

  // Add user to group_members
  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: invitation.group_id,
    user_id: user.id,
  })

  if (memberError) {
    return { success: false, error: memberError.message }
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('group_invitations')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${invitation.group_id}`)
  return { success: true, groupId: invitation.group_id }
}

export async function declineInvitation(invitationId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get user's email from users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  if (userDataError || !userData) {
    return { success: false, error: 'Could not find user data' }
  }

  // Fetch invitation and verify it's for this user
  const { data: invitation, error: inviteError } = await supabase
    .from('group_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invitation) {
    return { success: false, error: 'Invitation not found or already responded' }
  }

  if (invitation.invited_email !== userData.email) {
    return { success: false, error: 'This invitation is not for you' }
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('group_invitations')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', invitationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/groups')
  return { success: true }
}

export async function cancelInvitation(
  invitationId: string,
  groupId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Delete invitation (RLS ensures only inviter can delete their pending invitations)
  const { error: deleteError } = await supabase
    .from('group_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('invited_by_user_id', user.id)
    .eq('status', 'pending')

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
