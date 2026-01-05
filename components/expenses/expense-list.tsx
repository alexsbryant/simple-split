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
  // Sort by createdAt (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

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
        <div className="flex flex-col gap-3">
          {sortedExpenses.map((expense) => {
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
      )}
    </section>
  )
}
