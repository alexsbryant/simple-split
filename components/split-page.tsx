'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Group, Expense } from '@/types'
import { calculateBalances } from '@/lib/balance'
import { BalanceSummary } from '@/components/balances/balance-summary'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ExpenseList } from '@/components/expenses/expense-list'
import { Nav } from '@/components/nav'
import { InviteButton, InviteFormPanel } from '@/components/invitations/invite-form'
import { GroupInvitationsList } from '@/components/invitations/group-invitations-list'
import { Button } from '@/components/ui/button'
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expenses'
import { deleteGroup } from '@/app/actions/groups'

type PendingInvitation = {
  id: string
  invitedEmail: string
  invitedByUserId: string
  createdAt: string
}

interface SimpleSplitPageProps {
  currentUser: User
  group: Group
  users: User[]
  initialExpenses: Expense[]
  pendingInvitations: PendingInvitation[]
  isCreator: boolean
  creatorName: string
}

export function SimpleSplitPage({
  currentUser,
  group,
  users,
  initialExpenses,
  pendingInvitations,
  isCreator,
  creatorName,
}: SimpleSplitPageProps) {
  const router = useRouter()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

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

  // Delete group (creator only)
  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      `Delete "${group.name}"? This will permanently delete all expenses, members, and invitations. This action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingGroup(true)
    setDeleteError(null)

    const result = await deleteGroup(group.id)

    if (result.success) {
      router.push('/groups')
    } else {
      setDeleteError(result.error || 'Failed to delete group')
      setDeletingGroup(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold text-white">{group.name}</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Created by {creatorName}
              </p>
            </div>
            {isCreator && (
              <div className="pt-2">
                <InviteButton onClick={() => setIsInviteOpen(true)} />
              </div>
            )}
            {/* Form panel on desktop - appears next to button */}
            {isCreator && isInviteOpen && (
              <div className="hidden md:block pt-2">
                <InviteFormPanel groupId={group.id} onClose={() => setIsInviteOpen(false)} />
              </div>
            )}
          </div>
          {/* Form panel on mobile - appears below header */}
          {isCreator && isInviteOpen && (
            <div className="md:hidden mt-4">
              <InviteFormPanel groupId={group.id} onClose={() => setIsInviteOpen(false)} />
            </div>
          )}
        </header>

        {/* Pending Invitations */}
        <GroupInvitationsList
          invitations={pendingInvitations}
          groupId={group.id}
          currentUserId={currentUser.id}
        />

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

        {/* Danger Zone - Only visible to creator */}
        {isCreator && (
          <section className="glass p-6 mt-8">
            <h2 className="text-lg font-semibold text-white mb-3">Danger Zone</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Once you delete a group, there is no going back. All expenses and data will be permanently deleted.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteGroup}
              disabled={deletingGroup}
              className="cursor-pointer"
            >
              {deletingGroup ? 'Deleting...' : 'Delete Group'}
            </Button>
            {deleteError && (
              <p className="text-sm text-red-400 mt-2">{deleteError}</p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
