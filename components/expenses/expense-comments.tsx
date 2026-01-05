'use client'

import { useState, useEffect, useTransition, useOptimistic } from 'react'
import { ExpenseComment, User } from '@/types'
import { addComment, deleteComment, getExpenseComments } from '@/app/actions/comments'
import { formatDate } from '@/lib/utils'

interface ExpenseCommentsProps {
  expenseId: string
  groupId: string
  currentUserId: string
  commentCount: number
  users: User[]
  isExpanded: boolean
  onToggleExpand: () => void
}

export function ExpenseComments({
  expenseId,
  groupId,
  currentUserId,
  commentCount,
  users,
  isExpanded,
  onToggleExpand,
}: ExpenseCommentsProps) {
  const [comments, setComments] = useState<ExpenseComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  // Optimistic count
  const [optimisticCount, addOptimisticCount] = useOptimistic(
    commentCount,
    (count: number, delta: number) => count + delta
  )

  // Load comments when expanding
  const handleToggle = async () => {
    if (!isExpanded && comments.length === 0 && commentCount > 0) {
      setIsLoading(true)
      const { comments: fetched } = await getExpenseComments(expenseId)
      setComments(fetched)
      setIsLoading(false)
    }
    onToggleExpand()
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const content = newComment.trim()
    setNewComment('')

    startTransition(async () => {
      addOptimisticCount(1)
      const result = await addComment(expenseId, content, groupId)
      if (result.success && result.comment) {
        setComments(prev => [...prev, result.comment!])
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      addOptimisticCount(-1)
      const result = await deleteComment(commentId, groupId)
      if (result.success) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    })
  }

  const getUserName = (userId: string): string => {
    if (userId === currentUserId) return 'You'
    const user = users.find(u => u.id === userId)
    return user?.displayName ?? 'Unknown'
  }

  return (
    <>
      {/* Comment count trigger - inline element */}
      <button
        onClick={handleToggle}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        {optimisticCount === 0
          ? 'Add comment'
          : `${optimisticCount} comment${optimisticCount === 1 ? '' : 's'}`
        }
      </button>
    </>
  )
}

// Separate component for the expanded panel - rendered outside the flex row
export function ExpenseCommentsPanel({
  expenseId,
  groupId,
  currentUserId,
  commentCount,
  users,
}: Omit<ExpenseCommentsProps, 'isExpanded' | 'onToggleExpand'>) {
  const [comments, setComments] = useState<ExpenseComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  // Load comments on mount
  useEffect(() => {
    if (commentCount > 0) {
      getExpenseComments(expenseId).then(({ comments: fetched }) => {
        setComments(fetched)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [expenseId, commentCount])

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const content = newComment.trim()
    setNewComment('')

    startTransition(async () => {
      const result = await addComment(expenseId, content, groupId)
      if (result.success && result.comment) {
        setComments(prev => [...prev, result.comment!])
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      const result = await deleteComment(commentId, groupId)
      if (result.success) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    })
  }

  const getUserName = (userId: string): string => {
    if (userId === currentUserId) return 'You'
    const user = users.find(u => u.id === userId)
    return user?.displayName ?? 'Unknown'
  }

  return (
    <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
          {/* Loading state */}
          {isLoading && (
            <div className="text-sm text-[var(--text-muted)] py-2">Loading...</div>
          )}

          {/* Comment list */}
          {!isLoading && comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className="flex justify-between gap-2 p-2 rounded-lg bg-[var(--bg-card)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="font-medium text-[var(--text-secondary)]">
                        {getUserName(comment.userId)}
                      </span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] mt-0.5 break-words">
                      {comment.content}
                    </p>
                  </div>
                  {comment.userId === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isPending}
                      className="text-[var(--text-muted)] hover:text-[var(--negative)] transition-colors p-1 shrink-0"
                      aria-label="Delete comment"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              className="flex-1 px-3 py-1.5 text-sm glass-input rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={isPending || !newComment.trim()}
              className="
                px-3 py-1.5 text-sm rounded-lg
                bg-[var(--accent)] text-white
                hover:opacity-90 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Post
            </button>
          </div>
    </div>
  )
}
