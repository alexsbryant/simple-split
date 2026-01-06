'use client'

import { useState, useRef } from 'react'
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
import { deleteGroup, updateGroupName } from '@/app/actions/groups'

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
  const formRef = useRef<HTMLElement>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(group.name)
  const [nameError, setNameError] = useState<string | null>(null)
  const [updatingName, setUpdatingName] = useState(false)

  // Calculate balances from server data
  const balances = calculateBalances(initialExpenses, users)

  // Add new expense
  const handleAddExpense = async (data: {
    groupId: string
    paidByUserId: string
    amount: number
    description: string
    splits?: { userId: string; amount: number }[]
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
    splits?: { userId: string; amount: number }[]
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
    // If clicking the same expense, toggle off
    if (editingExpense?.id === expense.id) {
      setEditingExpense(null)
    } else {
      // Different expense or first time editing
      setEditingExpense(expense)
      // Scroll to form after state update with offset for breathing room
      setTimeout(() => {
        if (formRef.current) {
          const elementPosition = formRef.current.getBoundingClientRect().top + window.scrollY
          const offsetPosition = elementPosition - 20 // 20px breathing room above form
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 0)
    }
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

  // Start editing group name
  const handleStartEditName = () => {
    setIsEditingName(true)
    setEditedName(group.name)
    setNameError(null)
  }

  // Cancel editing group name
  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedName(group.name)
    setNameError(null)
  }

  // Save group name
  const handleSaveGroupName = async () => {
    const trimmedName = editedName.trim()

    // Client-side validation
    if (!trimmedName) {
      setNameError('Group name cannot be empty')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('Group name must be 100 characters or less')
      return
    }

    // Skip if unchanged
    if (trimmedName === group.name) {
      setIsEditingName(false)
      return
    }

    setUpdatingName(true)
    setNameError(null)

    const result = await updateGroupName(group.id, trimmedName)

    if (result.success) {
      setIsEditingName(false)
      router.refresh()
    } else {
      setNameError(result.error || 'Failed to update group name')
      setUpdatingName(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[640px] lg:max-w-[1200px] mx-auto px-4 py-8 lg:[zoom:0.9]">
        {/* Desktop grid layout, mobile single column */}
        <div className="lg:grid lg:grid-cols-[60%_35%] lg:gap-[5%]">
          {/* Left column - main interactive content */}
          <div className="space-y-6">
            {/* Header */}
            <header>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {!isEditingName ? (
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-title)' }}>{group.name}</h1>
                  {isCreator && (
                    <button
                      onClick={handleStartEditName}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer"
                      aria-label="Edit group name"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => {
                        setEditedName(e.target.value)
                        if (nameError) setNameError(null)
                      }}
                      className="flex-1 px-4 py-2 glass-input text-2xl md:text-3xl font-semibold"
                      placeholder="Group name"
                      maxLength={100}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveGroupName()
                        if (e.key === 'Escape') handleCancelEditName()
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveGroupName}
                        disabled={updatingName}
                        variant="primary"
                        className="text-xs px-4 py-2"
                      >
                        {updatingName ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelEditName}
                        disabled={updatingName}
                        variant="secondary"
                        className="text-xs px-4 py-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  {nameError && (
                    <p className="text-sm text-[var(--negative)] pl-4">{nameError}</p>
                  )}
                </div>
              )}
              <p className="text-[var(--text-secondary)] mt-1">
                Created by {creatorName}
              </p>
            </div>
            {isCreator && (
              <div className="pt-2">
                <InviteButton onClick={() => setIsInviteOpen(!isInviteOpen)} />
              </div>
            )}
          </div>
          {/* Invite form - appears as block below header */}
          {isCreator && isInviteOpen && (
            <div className="mt-4">
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
            <BalanceSummary
              balances={balances}
              currentUserId={currentUser.id}
              currency={group.currency}
              groupId={group.id}
              onSettlementSuccess={() => router.refresh()}
            />

            {/* Error Display */}
            {error && (
              <div className="p-4 glass border border-[var(--negative)]">
                <p className="text-[var(--negative)] text-sm">{error}</p>
              </div>
            )}

            {/* Expense Form */}
            <ExpenseForm
              ref={formRef}
              onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
              currentUserId={currentUser.id}
              groupId={group.id}
              members={users}
              currency={group.currency}
              editingExpense={editingExpense}
              onCancelEdit={handleCancelEdit}
              loading={loading}
            />
          </div>

          {/* Right column - expense list */}
          <div className="mt-5 lg:mt-14.5">
            {/* Expense List */}
            <ExpenseList
              expenses={initialExpenses}
              currentUserId={currentUser.id}
              users={users}
              groupId={group.id}
              onEdit={handleEditClick}
              onDelete={handleDeleteExpense}
              loading={loading}
              currency={group.currency}
            />
          </div>
        </div>

        {/* Danger Zone - Only visible to creator */}
        {isCreator && (
          <section className="glass p-6 mt-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-title)' }}>Danger Zone</h2>
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
