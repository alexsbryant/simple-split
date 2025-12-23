'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GroupCreateFormProps {
  userId: string
  onCancel: () => void
}

export function GroupCreateForm({ userId, onCancel }: GroupCreateFormProps) {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    setLoading(true)

    const supabase = createClient()

    try {
      // 1. Insert new group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({ name: groupName.trim(), created_by: userId })
        .select('id')
        .single()

      if (groupError) throw groupError

      // 2. Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: newGroup.id, user_id: userId })

      if (memberError) throw memberError

      // 3. Redirect to new group
      router.push(`/groups/${newGroup.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Create New Group</h2>

      <div className="space-y-4">
        <Input
          label="Group Name"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Roommates, Trip to Paris"
          required
        />

        {error && (
          <p className="text-sm text-[var(--negative)] text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
