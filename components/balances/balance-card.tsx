import { UserBalance } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  balance: UserBalance
  currency: string
}

export function BalanceCard({ balance, currency }: BalanceCardProps) {
  const isPositive = balance.balance > 0
  const isNegative = balance.balance < 0

  const amountColor = isPositive
    ? 'var(--positive)'
    : isNegative
      ? 'var(--negative)'
      : 'var(--settled)'

  const formattedBalance = isPositive
    ? `+${formatCurrency(balance.balance, currency)}`
    : formatCurrency(balance.balance, currency)

  return (
    <div className="glass-sm p-4 transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {balance.displayName}
        </span>
        <span
          className="text-lg font-semibold break-all"
          style={{ color: amountColor }}
        >
          {formattedBalance}
        </span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        Paid {formatCurrency(balance.totalPaid, currency)}
      </p>
    </div>
  )
}
