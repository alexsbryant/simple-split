'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { ExpenseReaction } from '@/types'
import { toggleReaction } from '@/app/actions/reactions'

// Common emojis for expense reactions
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '👏', '💸']

// Aggregated reaction for UI display
type AggregatedReaction = {
  emoji: string
  count: number
  userIds: string[]
  hasCurrentUser: boolean
}

interface ExpenseReactionsProps {
  expenseId: string
  groupId: string
  currentUserId: string
  reactions: ExpenseReaction[]
}

function aggregateReactions(
  reactions: ExpenseReaction[],
  currentUserId: string
): AggregatedReaction[] {
  const map = new Map<string, { count: number; userIds: string[] }>()

  for (const r of reactions) {
    const existing = map.get(r.emoji)
    if (existing) {
      existing.count++
      existing.userIds.push(r.userId)
    } else {
      map.set(r.emoji, { count: 1, userIds: [r.userId] })
    }
  }

  return Array.from(map.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    userIds: data.userIds,
    hasCurrentUser: data.userIds.includes(currentUserId),
  }))
}

export function ExpenseReactions({
  expenseId,
  groupId,
  currentUserId,
  reactions,
}: ExpenseReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Optimistic state for reactions
  const [optimisticReactions, addOptimisticReaction] = useOptimistic(
    reactions,
    (state: ExpenseReaction[], { emoji, add }: { emoji: string; add: boolean }) => {
      if (add) {
        return [...state, {
          id: `temp-${Date.now()}`,
          expenseId,
          userId: currentUserId,
          emoji,
          createdAt: new Date().toISOString(),
        }]
      } else {
        return state.filter(r => !(r.emoji === emoji && r.userId === currentUserId))
      }
    }
  )

  const aggregated = aggregateReactions(optimisticReactions, currentUserId)

  const handleReaction = (emoji: string) => {
    const hasReaction = aggregated.find(a => a.emoji === emoji)?.hasCurrentUser ?? false

    startTransition(async () => {
      addOptimisticReaction({ emoji, add: !hasReaction })
      await toggleReaction(expenseId, emoji, groupId)
    })

    setShowPicker(false)
  }

  return (
    <div className="flex items-center gap-1 relative">
      {/* Existing reactions */}
      {aggregated.map(({ emoji, count, hasCurrentUser }) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          disabled={isPending}
          className={`
            flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs
            transition-all duration-150
            ${hasCurrentUser
              ? 'bg-[var(--accent)]/20 border border-[var(--accent)]'
              : 'bg-[var(--bg-card)] border border-[var(--glass-border)] hover:bg-[var(--item-hover)]'
            }
            disabled:opacity-50
          `}
          aria-label={`${emoji} reaction, ${count} ${count === 1 ? 'person' : 'people'}`}
        >
          <span>{emoji}</span>
          <span className="text-[var(--text-secondary)]">{count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="
          w-6 h-6 rounded-full flex items-center justify-center
          text-[var(--text-muted)] hover:text-[var(--text-primary)]
          hover:bg-[var(--item-hover)] transition-colors
        "
        aria-label="Add reaction"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Emoji picker popup */}
      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="
            absolute top-full right-0 mt-1 z-20
            flex gap-1 p-2 rounded-lg
            bg-[var(--bg-card-elevated)] border border-[var(--glass-border)]
            shadow-lg
          ">
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="
                  w-8 h-8 flex items-center justify-center
                  rounded hover:bg-[var(--item-hover)] transition-colors text-lg
                "
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
