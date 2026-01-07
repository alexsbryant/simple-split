'use client'

import { useEffect, useState } from 'react'
import { getNotifications } from '@/app/actions/notifications'
import { ActivityCountPill } from '@/components/ui/activity-count-pill'
import Link from 'next/link'

interface GroupsListProps {
  groups: Array<{
    id: string
    name: string
    createdBy: string
    creatorName: string
    memberCount: number
  }>
  userId: string
}

export function GroupsList({ groups, userId }: GroupsListProps) {
  const [unreadByGroup, setUnreadByGroup] = useState<Record<string, number>>(
    {}
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true)
      const result = await getNotifications()
      if (result.success && result.notifications) {
        // Calculate unread counts per group
        const counts = result.notifications
          .filter((n) => !n.read && n.groupId)
          .reduce(
            (acc, n) => {
              acc[n.groupId!] = (acc[n.groupId!] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        setUnreadByGroup(counts)
      }
      setLoading(false)
    }
    fetchCounts()

    // Refetch when the page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCounts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Link
          key={group.id}
          href={`/groups/${group.id}`}
          className="glass p-4 block transition-all duration-300 hover:bg-[var(--item-hover)] flex items-start justify-between"
        >
          <div className="flex-1">
            <h3
              className="font-semibold text-lg"
              style={{ color: 'var(--text-title)' }}
            >
              {group.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {group.createdBy !== userId &&
                `Created by ${group.creatorName} · `}
              {group.memberCount}{' '}
              {group.memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
          {!loading && (
            <ActivityCountPill
              count={unreadByGroup[group.id] || 0}
              variant="notification"
            />
          )}
        </Link>
      ))}
    </div>
  )
}
