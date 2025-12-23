'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GroupCreateForm } from './group-create-form'

interface CreateGroupSectionProps {
  userId: string
}

export function CreateGroupSection({ userId }: CreateGroupSectionProps) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return <GroupCreateForm userId={userId} onCancel={() => setShowForm(false)} />
  }

  return (
    <div className="mb-6">
      <Button variant="primary" onClick={() => setShowForm(true)}>
        Create new group
      </Button>
    </div>
  )
}
