'use client'

import { useState } from 'react'
import { Expense } from '@/types'
import { CURRENT_USER, MOCK_USERS, MOCK_GROUP, INITIAL_EXPENSES } from '@/lib/mock-data'
import { calculateBalances } from '@/lib/balance'
import { BalanceSummary } from '@/components/balances/balance-summary'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ExpenseList } from '@/components/expenses/expense-list'

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Calculate balances on each render
  const balances = calculateBalances(expenses, MOCK_USERS)

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
    <div className="min-h-screen bg-[#C5D1C5] paper-texture">
      <main className="max-w-[640px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-[#1A1A1A] font-[family-name:var(--font-bodoni)]">Simple Split</h1>
          <p className="text-[#666666] mt-1">
            {MOCK_GROUP.name}
          </p>
        </header>

        {/* Balance Summary */}
        <div className="mb-6">
          <BalanceSummary balances={balances} currentUserId={CURRENT_USER.id} />
        </div>

        {/* Expense Form */}
        <div className="mb-6">
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            currentUserId={CURRENT_USER.id}
            groupId={MOCK_GROUP.id}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Expense List */}
        <ExpenseList
          expenses={expenses}
          currentUserId={CURRENT_USER.id}
          users={MOCK_USERS}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
        />
      </main>
    </div>
  )
}
