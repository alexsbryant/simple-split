import { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ExpenseItemProps {
  expense: Expense
  payerName: string
  isOwner: boolean
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({
  expense,
  payerName,
  isOwner,
  onEdit,
  onDelete,
}: ExpenseItemProps) {
  return (
    <div className="border border-[#E5E5E5] bg-white p-4 rounded-lg shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        {/* Date */}
        <span className="text-sm text-[#888888] w-16 shrink-0">
          {formatDate(expense.createdAt)}
        </span>

        {/* Description */}
        <span className="flex-1 font-medium text-[#1A1A1A]">
          {expense.description}
        </span>

        {/* Payer */}
        <span className="text-sm text-[#888888]">
          {payerName}
        </span>

        {/* Amount */}
        <span className="font-semibold w-20 text-right text-[#1A1A1A]">
          {formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Actions - only for owner */}
      {isOwner && (
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="secondary"
            onClick={() => onEdit(expense)}
            className="text-xs py-1 px-2"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(expense.id)}
            className="text-xs py-1 px-2"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
