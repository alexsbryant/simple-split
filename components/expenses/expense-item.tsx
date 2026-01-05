'use client'

import { useState } from 'react'
import { Expense, User } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ExpenseReactions } from './expense-reactions'
import { ExpenseComments, ExpenseCommentsPanel } from './expense-comments'

interface ExpenseItemProps {
  expense: Expense
  payerName: string
  isOwner: boolean
  currentUserId: string
  groupId: string
  users: User[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  disabled?: boolean
  currency: string
  settledTotal?: number | null
}

export function ExpenseItem({
  expense,
  payerName,
  isOwner,
  currentUserId,
  groupId,
  users,
  onEdit,
  onDelete,
  disabled = false,
  currency,
  settledTotal,
}: ExpenseItemProps) {
  const isSettlement = expense.isSettlement
  const [commentsExpanded, setCommentsExpanded] = useState(false)

  return (
    <div
      className={`glass-sm p-3 md:p-4 transition-all duration-300 hover:bg-[var(--item-hover)] ${
        isSettlement ? 'border-l-[var(--positive)]' : ''
      }`}
    >
      {/* Mobile: 2-line compact layout, Desktop: horizontal layout */}

      {/* Line 1: Description + Reactions + Amount */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 font-medium text-[var(--text-primary)] text-sm md:text-base leading-tight flex items-center gap-2">
          {isSettlement && (
            <svg
              className="w-4 h-4 text-[var(--positive)] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Settlement"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {expense.description}
        </span>

        {/* Reactions + Amount */}
        <div className="flex items-center gap-2 shrink-0">
          <ExpenseReactions
            expenseId={expense.id}
            groupId={groupId}
            currentUserId={currentUserId}
            reactions={expense.reactions ?? []}
          />
          <span
            className={`font-semibold ${
              isSettlement ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'
            }`}
          >
            {formatCurrency(expense.amount, currency)}
          </span>
        </div>
      </div>

      {/* Settlement Period Total */}
      {isSettlement && settledTotal !== null && settledTotal !== undefined && (
        <div className="mt-1.5 text-xs text-[var(--text-muted)]">
          Total settled: {formatCurrency(settledTotal, currency)}
        </div>
      )}

      {/* Line 2: Payer • Date • Comments + Actions */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--text-muted)]">
          <span>{payerName} · {formatDate(expense.createdAt)}</span>
          <span className="text-[var(--glass-border)]">·</span>
          <ExpenseComments
            expenseId={expense.id}
            groupId={groupId}
            currentUserId={currentUserId}
            commentCount={expense.commentCount ?? 0}
            users={users}
            isExpanded={commentsExpanded}
            onToggleExpand={() => setCommentsExpanded(!commentsExpanded)}
          />
        </div>

        {/* Actions - only for owner, and settlements are not editable */}
        {isOwner && !isSettlement && (
          <div className="flex gap-1">
            <Button
              variant="secondary"
              onClick={() => onEdit(expense)}
              className="p-1.5 md:p-2"
              disabled={disabled}
              aria-label="Edit expense"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(`Delete "${expense.description}"?`)) {
                  onDelete(expense.id)
                }
              }}
              className="p-1.5 md:p-2"
              disabled={disabled}
              aria-label="Delete expense"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Expanded comments section - rendered outside the flex row */}
      {commentsExpanded && (
        <ExpenseCommentsPanel
          expenseId={expense.id}
          groupId={groupId}
          currentUserId={currentUserId}
          commentCount={expense.commentCount ?? 0}
          users={users}
        />
      )}
    </div>
  )
}
