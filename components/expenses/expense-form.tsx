'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Expense } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'

interface ExpenseFormData {
  groupId: string
  paidByUserId: string
  amount: number
  description: string
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void
  currentUserId: string
  groupId: string
  editingExpense?: Expense | null
  onCancelEdit?: () => void
}

export function ExpenseForm({
  onSubmit,
  currentUserId,
  groupId,
  editingExpense,
  onCancelEdit,
}: ExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')

  const isEditing = !!editingExpense

  // Pre-fill form when editing
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description)
      setAmount(editingExpense.amount.toString())
    } else {
      setDescription('')
      setAmount('')
    }
  }, [editingExpense])

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

    // Use date/time as description if none provided
    const finalDescription = description.trim() || formatDateTime(new Date().toISOString())

    onSubmit({
      groupId,
      paidByUserId: currentUserId,
      amount: parsedAmount,
      description: finalDescription,
    })

    // Clear form after submission (only for new expenses)
    if (!isEditing) {
      setDescription('')
      setAmount('')
    }
  }

  const handleCancel = () => {
    setDescription('')
    setAmount('')
    onCancelEdit?.()
  }

  return (
    <section className="glass overflow-hidden">
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary">
              {isEditing ? 'Save' : 'Add Expense'}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}
