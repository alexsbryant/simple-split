'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Group, Expense } from '@/types'
import { calculateBalances } from '@/lib/balance'
import { BalanceSummary } from '@/components/balances/balance-summary'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ExpenseList } from '@/components/expenses/expense-list'
import { Nav } from '@/components/nav'
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expenses'

interface SimpleSplitPageProps {
  currentUser: User
  group: Group
  users: User[]
  initialExpenses: Expense[]
}

export function SimpleSplitPage({
  currentUser,
  group,
  users,
  initialExpenses,
}: SimpleSplitPageProps) {
  const router = useRouter()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate balances from server data
  const balances = calculateBalances(initialExpenses, users)

  // Add new expense
  const handleAddExpense = async (data: {
    groupId: string
    paidByUserId: string
    amount: number
    description: string
  }) => {
    setLoading(true)
    setError(null)

    const result = await createExpense(data)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to add expense')
    }

    setLoading(false)
  }

  // Update existing expense
  const handleUpdateExpense = async (data: {
    groupId: string
    paidByUserId: string
    amount: number
    description: string
  }) => {
    if (!editingExpense) return

    setLoading(true)
    setError(null)

    const result = await updateExpense(editingExpense.id, data)

    if (result.success) {
      setEditingExpense(null)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update expense')
    }

    setLoading(false)
  }

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    setLoading(true)
    setError(null)

    const result = await deleteExpense(id, group.id)

    if (result.success) {
      if (editingExpense?.id === id) {
        setEditingExpense(null)
      }
      router.refresh()
    } else {
      setError(result.error || 'Failed to delete expense')
    }

    setLoading(false)
  }

  // Start editing
  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingExpense(null)
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-white font-[family-name:var(--font-bodoni)]">Simple Split</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {group.name}
          </p>
        </header>

        {/* Balance Summary */}
        <div className="mb-6">
          <BalanceSummary balances={balances} currentUserId={currentUser.id} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 glass border border-[var(--negative)]">
            <p className="text-[var(--negative)] text-sm">{error}</p>
          </div>
        )}

        {/* Expense Form */}
        <div className="mb-6">
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            currentUserId={currentUser.id}
            groupId={group.id}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
            loading={loading}
          />
        </div>

        {/* Expense List */}
        <ExpenseList
          expenses={initialExpenses}
          currentUserId={currentUser.id}
          users={users}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
          loading={loading}
        />
      </main>
    </div>
  )
}
