import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
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
  scrollTarget?: {
    expenseId: string
    highlight?: string
    showComments?: boolean
  } | null
  onScrollComplete?: () => void
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
  scrollTarget,
  onScrollComplete,
}: ExpenseListProps) {
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(10)
  const ITEMS_PER_PAGE = 10

  // Ref map for expense items
  const expenseRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const setExpenseRef = useCallback((expenseId: string, element: HTMLDivElement | null) => {
    if (element) {
      expenseRefs.current.set(expenseId, element)
    } else {
      expenseRefs.current.delete(expenseId)
    }
  }, [])

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

  // Auto-expand pagination if scroll target is beyond visible range
  useEffect(() => {
    if (scrollTarget?.expenseId) {
      const targetIndex = sortedExpenses.findIndex(
        exp => exp.id === scrollTarget.expenseId
      )

      if (targetIndex >= 0 && targetIndex >= visibleCount) {
        // Expand to show target expense + some buffer
        setVisibleCount(Math.max(targetIndex + 5, visibleCount))
      }
    }
  }, [scrollTarget, sortedExpenses, visibleCount])

  // Scroll to target expense after pagination expansion
  useEffect(() => {
    if (scrollTarget?.expenseId) {
      // Check if expense exists
      const expenseExists = sortedExpenses.some(exp => exp.id === scrollTarget.expenseId)

      if (!expenseExists) {
        // Clean up and bail out
        onScrollComplete?.()
        return
      }

      // Wait for DOM update after pagination expansion
      const timeoutId = setTimeout(() => {
        const targetElement = expenseRefs.current.get(scrollTarget.expenseId)

        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY
          const offsetPosition = elementPosition - 20 // 20px breathing room

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })

          // Clear scroll target after successful scroll
          setTimeout(() => {
            onScrollComplete?.()
          }, 600) // Wait for smooth scroll animation
        }
      }, 100) // Delay to ensure DOM is ready

      return () => clearTimeout(timeoutId)
    }
  }, [scrollTarget, displayedExpenses, sortedExpenses, onScrollComplete])

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
                ref={(el) => setExpenseRef(expense.id, el)}
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
                scrollTarget={scrollTarget?.expenseId === expense.id ? scrollTarget : null}
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
