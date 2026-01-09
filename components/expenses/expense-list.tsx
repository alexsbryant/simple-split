import { useState, useMemo } from 'react'
import { Expense, User } from '@/types'
import { ExpenseItem } from './expense-item'

interface ExpenseListProps {
  expenses: Expense[]
  currentUserId: string
  users: User[]
  groupId: string
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  loading?: boolean
  currency: string
}

export function ExpenseList({
  expenses,
  currentUserId,
  users,
  groupId,
  onEdit,
  onDelete,
  loading = false,
  currency,
}: ExpenseListProps) {
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(10)
  const ITEMS_PER_PAGE = 10

  // Sort by createdAt (newest first) - memoized for performance
  const sortedExpenses = useMemo(
    () => [...expenses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [expenses]
  )

  // Slice for pagination
  const displayedExpenses = sortedExpenses.slice(0, visibleCount)
  const hasMore = visibleCount < sortedExpenses.length

  // Handle show more
  const handleShowMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  // Helper to get payer name
  const getPayerName = (userId: string): string => {
    const user = users.find((u) => u.id === userId)
    return user?.displayName ?? 'Unknown'
  }

  return (
    <section>
      <h2 className="section-label mb-4">
        Expenses
      </h2>

      {sortedExpenses.length === 0 ? (
        <div className="glass p-6 text-center text-[var(--text-muted)]">
          No expenses yet. Add one above.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {displayedExpenses.map((expense) => {
            // Calculate total settled amount for settlement expenses
            const settledTotal = expense.isSettlement
              ? expenses
                  .filter(exp =>
                    !exp.isSettlement &&
                    new Date(exp.createdAt) <= new Date(expense.createdAt)
                  )
                  .reduce((sum, exp) => sum + exp.amount, 0)
              : null

            return (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                payerName={getPayerName(expense.paidByUserId)}
                isOwner={expense.paidByUserId === currentUserId}
                currentUserId={currentUserId}
                groupId={groupId}
                users={users}
                onEdit={onEdit}
                onDelete={onDelete}
                disabled={loading}
                currency={currency}
                settledTotal={settledTotal}
              />
            )
          })}
          </div>

          {/* Show More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleShowMore}
                className="
                  px-3 py-1.5
                  text-sm font-semibold
                  rounded-full
                  bg-[var(--accent)] text-white
                  hover:brightness-110 hover:shadow-sm
                  active:scale-[0.98]
                  transition-all duration-150
                  cursor-pointer
                "
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
