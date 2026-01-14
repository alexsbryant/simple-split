'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/app/actions/notifications'
import { ActivityCountPill } from '@/components/ui/activity-count-pill'
import { createClient } from '@/lib/supabase'

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getNotificationMessage(notification: Notification): string {
  const actor = notification.actorDisplayName
  const group = notification.groupName || 'a group'
  const expense = notification.expenseDescription || 'an expense'

  switch (notification.type) {
    case 'expense_added':
      return `${actor} added "${expense}" in ${group}`
    case 'expense_reacted':
      const emoji = notification.metadata.emoji || ''
      return `${actor} reacted ${emoji} to "${expense}"`
    case 'expense_commented':
      return `${actor} commented on "${expense}"`
    case 'debt_settled':
      const amount = notification.metadata.amount
      const amountStr = amount ? `$${amount.toFixed(2)}` : 'a debt'
      return `${actor} settled ${amountStr} in ${group}`
    default:
      return 'New notification'
  }
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'expense_added':
      return (
        <svg
          className="w-4 h-4 text-[var(--accent-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      )
    case 'expense_reacted':
      // Heart/like icon to represent reactions
      return (
        <svg
          className="w-4 h-4 text-[var(--accent-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )
    case 'expense_commented':
      return (
        <svg
          className="w-4 h-4 text-[var(--accent-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )
    case 'debt_settled':
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
  }
}

function buildNotificationUrl(notification: Notification): string {
  const baseUrl = `/groups/${notification.groupId}`

  // debt_settled or missing expenseId: no scroll params needed
  if (notification.type === 'debt_settled' || !notification.expenseId) {
    return baseUrl
  }

  // expense_added: scroll to expense only
  if (notification.type === 'expense_added') {
    return `${baseUrl}?scrollTo=${notification.expenseId}`
  }

  // expense_reacted: scroll to expense and highlight emoji
  if (notification.type === 'expense_reacted') {
    const emoji = notification.metadata.emoji
    return `${baseUrl}?scrollTo=${notification.expenseId}&highlight=${encodeURIComponent(emoji || '')}`
  }

  // expense_commented: scroll to expense and expand comments
  if (notification.type === 'expense_commented') {
    return `${baseUrl}?scrollTo=${notification.expenseId}&showComments=true`
  }

  return baseUrl
}

type NotificationsDropdownProps = {
  onUnreadCountChange?: (count: number) => void
}

export function NotificationsDropdown({
  onUnreadCountChange,
}: NotificationsDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Handle INSERT events from Realtime
  const handleInsert = async (payload: any) => {
    const newNotificationId = payload.new.id

    // Fetch single notification with joins
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        read_at,
        created_at,
        metadata,
        group_id,
        expense_id,
        actor:users!actor_user_id(display_name),
        group:groups(name),
        expense:expenses(description)
      `)
      .eq('id', newNotificationId)
      .single()

    if (!data) return

    // Type assertions for Supabase join results (returns single objects, not arrays)
    const actor = data.actor as unknown as { display_name: string } | null
    const group = data.group as unknown as { name: string } | null
    const expense = data.expense as unknown as { description: string } | null

    // Transform to Notification type
    const notification: Notification = {
      id: data.id,
      type: data.type,
      read: data.read_at !== null,
      createdAt: data.created_at,
      actorDisplayName: actor?.display_name || 'Unknown',
      groupId: data.group_id,
      groupName: group?.name || null,
      expenseId: data.expense_id,
      expenseDescription: expense?.description || null,
      metadata: data.metadata || {},
    }

    // Update state and unread count
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notification.id)) {
        return prev
      }

      // Prepend and keep only latest 20
      const updated = [notification, ...prev].slice(0, 20)

      // Calculate unread count from updated array (not stale closure)
      const unreadCount = updated.filter((n) => !n.read).length
      onUnreadCountChange?.(unreadCount)

      return updated
    })
  }

  // Handle UPDATE events from Realtime
  const handleUpdate = (payload: any) => {
    const updatedId = payload.new.id
    const newReadAt = payload.new.read_at

    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === updatedId
          ? { ...n, read: newReadAt !== null }
          : n
      )

      // Recalculate unread count
      const unreadCount = updated.filter((n) => !n.read).length
      onUnreadCountChange?.(unreadCount)

      return updated
    })
  }

  useEffect(() => {
    async function load() {
      const result = await getNotifications()
      if (result.success && result.notifications) {
        setNotifications(result.notifications)
        onUnreadCountChange?.(result.unreadCount || 0)
      }
      setLoading(false)
    }
    load()
  }, [onUnreadCountChange])

  // Setup Realtime subscription for dropdown content updates
  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    async function setupRealtimeSubscription() {
      const supabase = createClient()

      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create channel
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          handleInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          handleUpdate
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    startTransition(async () => {
      // Mark as read if not already
      if (!notification.read) {
        await markNotificationRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
        const newUnread = notifications.filter(
          (n) => !n.read && n.id !== notification.id
        ).length
        onUnreadCountChange?.(newUnread)
      }

      // Navigate to group with appropriate query params
      if (notification.groupId) {
        const url = buildNotificationUrl(notification)
        router.push(url)
      }
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      onUnreadCountChange?.(0)
    })
  }

  if (loading) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          No notifications yet
        </p>
      </div>
    )
  }

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div className="max-h-80 overflow-y-auto">
      {hasUnread && (
        <div className="px-3 py-1.5 border-b border-[var(--border-primary)] flex items-center justify-between gap-2">
          <ActivityCountPill
            count={notifications.filter((n) => !n.read).length}
            variant="notification"
          />
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs text-[var(--accent-primary)] opacity-60 hover:underline disabled:opacity-50 cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      )}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              onClick={() => handleNotificationClick(notification)}
              disabled={isPending}
              className={`w-full px-3 py-2.5 text-left transition-colors flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-card-elevated)]/80 ${
                notification.read ? 'opacity-60 hover:opacity-80' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    notification.read
                      ? 'text-[var(--text-secondary)]'
                      : 'text-[var(--text-primary)] font-medium'
                  }`}
                >
                  {getNotificationMessage(notification)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <div className="shrink-0 w-2 h-2 bg-[var(--accent-primary)] rounded-full mt-1.5" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
