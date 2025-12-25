import { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ExpenseItemProps {
  expense: Expense
  payerName: string
  isOwner: boolean
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function ExpenseItem({
  expense,
  payerName,
  isOwner,
  onEdit,
  onDelete,
  disabled = false,
}: ExpenseItemProps) {
  return (
    <div className="glass-sm p-4 transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Date */}
        <span className="text-sm text-[var(--text-muted)] w-full md:w-16 shrink-0">
          {formatDate(expense.createdAt)}
        </span>

        {/* Description */}
        <span className="flex-1 font-medium text-[var(--text-primary)]">
          {expense.description}
        </span>

        {/* Payer */}
        <span className="text-sm text-[var(--text-secondary)]">
          {payerName}
        </span>

        {/* Amount */}
        <span className="font-semibold min-w-20 text-right shrink-0 text-[var(--text-primary)]">
          {formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Actions - only for owner */}
      {isOwner && (
        <div className="flex gap-2 mt-3 md:justify-end">
          <Button
            variant="secondary"
            onClick={() => onEdit(expense)}
            className="text-xs py-1.5 px-4"
            disabled={disabled}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm(`Delete "${expense.description}"?`)) {
                onDelete(expense.id)
              }
            }}
            className="text-xs py-1.5 px-4"
            disabled={disabled}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
