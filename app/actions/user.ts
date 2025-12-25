'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ActionResult = {
  success: boolean
  error?: string
}

export async function updateDisplayName(displayName: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Get user ID from auth session (not client props)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate display name
  const trimmed = displayName.trim()
  if (!trimmed) {
    return { success: false, error: 'Display name is required' }
  }

  if (trimmed.length > 50) {
    return { success: false, error: 'Display name must be 50 characters or less' }
  }

  // Update only the user's display_name (does NOT touch groups)
  const { error } = await supabase
    .from('users')
    .update({ display_name: trimmed })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/groups')
  return { success: true }
}
