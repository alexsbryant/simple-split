'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr.' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
]

interface GroupCreateFormProps {
  userId: string
  onCancel: () => void
}

export function GroupCreateForm({ userId, onCancel }: GroupCreateFormProps) {
  const [groupName, setGroupName] = useState('')
  const [currency, setCurrency] = useState('USD')
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
        .insert({ name: groupName.trim(), currency, created_by: userId })
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

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 glass-input text-[var(--text-primary)] bg-transparent"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#1a1a2e] text-white">
                {c.symbol} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

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
