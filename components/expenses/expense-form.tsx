'use client'

import { useState, useEffect, FormEvent, forwardRef, useCallback } from 'react'
import { Expense, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SplitCustomizer } from './split-customizer'
import { formatDateTime } from '@/lib/utils'

interface ExpenseFormData {
  groupId: string
  paidByUserId: string
  amount: number
  description: string
  splits?: { userId: string; amount: number }[]
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void
  currentUserId: string
  groupId: string
  members: User[]
  currency: string
  editingExpense?: Expense | null
  onCancelEdit?: () => void
  loading?: boolean
}

export const ExpenseForm = forwardRef<HTMLElement, ExpenseFormProps>(function ExpenseForm({
  onSubmit,
  currentUserId,
  groupId,
  members,
  currency,
  editingExpense,
  onCancelEdit,
  loading = false,
}, ref) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [splits, setSplits] = useState<{ userId: string; amount: number }[] | null>(null)
  const [splitKey, setSplitKey] = useState(0) // Force re-render of SplitCustomizer
  const [splitCustomizerOpen, setSplitCustomizerOpen] = useState(false)

  const isEditing = !!editingExpense

  // Pre-fill form when editing
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description)
      setAmount(editingExpense.amount.toString())
      setSplitKey((k) => k + 1) // Force SplitCustomizer to re-initialize
      // Open customizer if expense has custom splits
      setSplitCustomizerOpen(!!editingExpense.splits && editingExpense.splits.length > 0)
    } else {
      setDescription('')
      setAmount('')
      setSplits(null)
      setSplitKey((k) => k + 1)
      setSplitCustomizerOpen(false)
    }
  }, [editingExpense])

  const handleSplitsChange = useCallback(
    (newSplits: { userId: string; amount: number }[] | null) => {
      setSplits(newSplits)
    },
    []
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Clear any previous errors
    setAmountError('')

    const parsedAmount = parseFloat(amount)
    // Only amount is required - description is optional
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Please enter an amount greater than 0')
      return
    }

    // Validate splits if provided
    if (splits && splits.length > 0) {
      const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0)
      if (Math.abs(splitTotal - parsedAmount) > 0.01) {
        setAmountError('Split amounts must equal expense amount')
        return
      }
      if (splits.every((s) => s.amount === 0)) {
        setAmountError('At least one member must be included in the split')
        return
      }
    }

    // Use date/time as description if none provided
    const finalDescription = description.trim() || formatDateTime(new Date().toISOString())

    onSubmit({
      groupId,
      paidByUserId: currentUserId,
      amount: parsedAmount,
      description: finalDescription,
      splits: splits ?? undefined,
    })

    // Clear form after submission (only for new expenses)
    if (!isEditing) {
      setDescription('')
      setAmount('')
      setSplits(null)
      setSplitKey((k) => k + 1)
      setSplitCustomizerOpen(false)
    }
  }

  const handleCancel = () => {
    setDescription('')
    setAmount('')
    setSplits(null)
    setSplitKey((k) => k + 1)
    setSplitCustomizerOpen(false)
    onCancelEdit?.()
  }

  const parsedAmount = parseFloat(amount) || 0
  const isSettlement = editingExpense?.isSettlement ?? false

  return (
    <section ref={ref} className="glass overflow-hidden">
      <div className="p-4 border-b border-[var(--glass-border)]">
        <h2 className="section-label">
          {isEditing ? 'Edit Expense' : 'Add Expense'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col gap-4">
          <Input
            label="Description (optional)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for?"
          />

          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (amountError) setAmountError('')
            }}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            error={amountError}
          />

          {/* Don't show split customizer for settlements */}
          {!isSettlement && (
            <SplitCustomizer
              key={splitKey}
              members={members}
              currentUserId={currentUserId}
              expenseAmount={parsedAmount}
              currency={currency}
              initialSplits={editingExpense?.splits}
              onSplitsChange={handleSplitsChange}
              isOpen={splitCustomizerOpen}
              onOpenChange={setSplitCustomizerOpen}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Save' : 'Add Expense'}
              </Button>
              {isEditing && (
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
              )}
            </div>
            {/* Customize split button - only show when customizer is closed and not a settlement */}
            {!isSettlement && !splitCustomizerOpen && members.length > 1 && (
              <button
                type="button"
                onClick={() => setSplitCustomizerOpen(true)}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                Customize split
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  )
})
