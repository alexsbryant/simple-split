'use client'

import { useState } from 'react'
import { User, Group, Expense } from '@/types'
import { calculateBalances } from '@/lib/balance'
import { BalanceSummary } from '@/components/balances/balance-summary'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ExpenseList } from '@/components/expenses/expense-list'

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
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Calculate balances on each render
  const balances = calculateBalances(expenses, users)

  // Add new expense
  const handleAddExpense = (data: {
    groupId: string
    paidByUserId: string
    amount: number
    description: string
  }) => {
    const now = new Date().toISOString()
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    setExpenses((prev) => [...prev, newExpense])
  }

  // Update existing expense
  const handleUpdateExpense = (data: {
    groupId: string
    paidByUserId: string
    amount: number
    description: string
  }) => {
    if (!editingExpense) return

    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === editingExpense.id
          ? {
              ...exp,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : exp
      )
    )
    setEditingExpense(null)
  }

  // Delete expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id))
    // Clear editing if we deleted the expense being edited
    if (editingExpense?.id === id) {
      setEditingExpense(null)
    }
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

        {/* Expense Form */}
        <div className="mb-6">
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            currentUserId={currentUser.id}
            groupId={group.id}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Expense List */}
        <ExpenseList
          expenses={expenses}
          currentUserId={currentUser.id}
          users={users}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
        />
      </main>
    </div>
  )
}
