import { UserBalance } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  balance: UserBalance
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const isPositive = balance.balance > 0
  const isNegative = balance.balance < 0

  const borderColor = isPositive
    ? '#1D7A1D'
    : isNegative
      ? '#C41E1E'
      : '#C4960C'

  const amountColor = isPositive
    ? '#1D7A1D'
    : isNegative
      ? '#C41E1E'
      : '#C4960C'

  const formattedBalance = isPositive
    ? `+${formatCurrency(balance.balance)}`
    : formatCurrency(balance.balance)

  return (
    <div
      className="bg-white border border-[#E5E5E5] p-4 rounded-lg shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium uppercase tracking-wider text-[#666666]">
          {balance.displayName}
        </span>
        <span
          className="text-lg font-semibold"
          style={{ color: amountColor }}
        >
          {formattedBalance}
        </span>
      </div>
      <p className="text-xs text-[#888888] mt-1">
        Paid {formatCurrency(balance.totalPaid)} · Owes {formatCurrency(balance.fairShare)}
      </p>
    </div>
  )
}
