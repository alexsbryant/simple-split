'use client'

import { useState, useEffect } from 'react'
import { User, ExpenseSplit } from '@/types'
import { formatCurrency } from '@/lib/utils'

export type SplitMode = 'equal' | 'select' | 'custom'

export type SplitData = {
  userId: string
  displayName: string
  included: boolean
  amount: number
}

interface SplitCustomizerProps {
  members: User[]
  currentUserId: string
  expenseAmount: number
  currency: string
  initialSplits?: ExpenseSplit[]
  onSplitsChange: (splits: { userId: string; amount: number }[] | null) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

// Round to 2 decimal places
const round2 = (n: number) => Math.round(n * 100) / 100

export function SplitCustomizer({
  members,
  currentUserId,
  expenseAmount,
  currency,
  initialSplits,
  onSplitsChange,
  isOpen,
  onOpenChange,
}: SplitCustomizerProps) {
  const [mode, setMode] = useState<SplitMode>('select')

  // Sort members with current user first
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1
    if (b.id === currentUserId) return 1
    return 0
  })

  const [splits, setSplits] = useState<SplitData[]>(() =>
    sortedMembers.map((m) => ({
      userId: m.id,
      displayName: m.displayName,
      included: true,
      amount: round2(expenseAmount / members.length),
    }))
  )

  // Initialize from existing splits when editing
  useEffect(() => {
    if (initialSplits && initialSplits.length > 0) {
      onOpenChange(true)
      // Determine mode based on whether amounts differ
      const amounts = initialSplits.map((s) => s.amount)
      const allSame = amounts.every((a) => Math.abs(a - amounts[0]) < 0.01)
      setMode(allSame ? 'select' : 'custom')

      const splitUserIds = new Set(initialSplits.map((s) => s.userId))
      setSplits(
        sortedMembers.map((m) => {
          const existingSplit = initialSplits.find((s) => s.userId === m.id)
          return {
            userId: m.id,
            displayName: m.displayName,
            included: splitUserIds.has(m.id),
            amount: round2(existingSplit?.amount ?? 0),
          }
        })
      )
    }
  }, [initialSplits, members, currentUserId, onOpenChange])

  // Recalculate when expense amount changes (only for non-custom modes)
  useEffect(() => {
    if (!isOpen) return

    if (mode === 'select') {
      const includedCount = splits.filter((s) => s.included).length
      if (includedCount > 0) {
        const perPerson = round2(expenseAmount / includedCount)
        setSplits((prev) =>
          prev.map((s) => ({
            ...s,
            amount: s.included ? perPerson : 0,
          }))
        )
      }
    }
  }, [expenseAmount, mode, isOpen])

  // Notify parent of changes
  useEffect(() => {
    if (!isOpen) {
      onSplitsChange(null) // null means equal split among all
    } else {
      const includedSplits = splits.filter((s) => s.included && s.amount > 0)
      if (includedSplits.length === 0) {
        onSplitsChange(null)
      } else {
        onSplitsChange(
          includedSplits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
          }))
        )
      }
    }
  }, [isOpen, splits, onSplitsChange])

  const handleToggleMember = (userId: string) => {
    setSplits((prev) => {
      const updated = prev.map((s) =>
        s.userId === userId ? { ...s, included: !s.included } : s
      )
      // Recalculate amounts for included members
      const includedCount = updated.filter((s) => s.included).length
      if (includedCount > 0) {
        const perPerson = round2(expenseAmount / includedCount)
        return updated.map((s) => ({
          ...s,
          amount: s.included ? perPerson : 0,
        }))
      }
      return updated
    })
  }

  const handleAmountChange = (userId: string, amountStr: string) => {
    const parsed = parseFloat(amountStr) || 0
    setSplits((prev) =>
      prev.map((s) =>
        s.userId === userId
          ? { ...s, amount: parsed, included: parsed > 0 }
          : s
      )
    )
  }

  const handleClose = () => {
    onOpenChange(false)
    setMode('select')
    setSplits(
      sortedMembers.map((m) => ({
        userId: m.id,
        displayName: m.displayName,
        included: true,
        amount: round2(expenseAmount / members.length),
      }))
    )
  }

  const splitTotal = splits.reduce(
    (sum, s) => sum + (s.included ? s.amount : 0),
    0
  )
  const remainder = expenseAmount - splitTotal
  const isValid = Math.abs(remainder) < 0.01

  // Don't show for single-member groups
  if (members.length <= 1) {
    return null
  }

  // When closed, render nothing - the button is placed in ExpenseForm
  if (!isOpen) {
    return null
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--glass-border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">
          Split between
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          aria-label="Close split customizer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('select')
            // Recalculate equal splits when switching to select mode
            const includedCount = splits.filter((s) => s.included).length
            if (includedCount > 0) {
              const perPerson = round2(expenseAmount / includedCount)
              setSplits((prev) =>
                prev.map((s) => ({
                  ...s,
                  amount: s.included ? perPerson : 0,
                }))
              )
            }
          }}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            mode === 'select'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Select members
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            mode === 'custom'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Custom amounts
        </button>
      </div>

      {/* Member list */}
      <div className="space-y-2">
        {splits.map((split) => (
          <div
            key={split.userId}
            className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[var(--item-hover)] transition-colors"
          >
            {mode === 'select' ? (
              <>
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={split.included}
                    onChange={() => handleToggleMember(split.userId)}
                    className="w-4 h-4 rounded accent-[var(--accent)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    {split.userId === currentUserId ? 'You' : split.displayName}
                  </span>
                </label>
                <span className="text-sm text-[var(--text-secondary)]">
                  {split.included
                    ? formatCurrency(split.amount, currency)
                    : '-'}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm text-[var(--text-primary)] flex-1">
                  {split.userId === currentUserId ? 'You' : split.displayName}
                </span>
                <input
                  type="number"
                  value={split.amount || ''}
                  onChange={(e) =>
                    handleAmountChange(split.userId, e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-24 px-3 py-1.5 text-right text-sm glass-input rounded-lg"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Validation feedback */}
      {mode === 'custom' && expenseAmount > 0 && (
        <div
          className={`mt-3 text-sm ${
            isValid ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
          }`}
        >
          {isValid
            ? 'Splits add up correctly'
            : `Remaining: ${formatCurrency(remainder, currency)}`}
        </div>
      )}
    </div>
  )
}
