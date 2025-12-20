import { GroupBalances } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { BalanceCard } from './balance-card'

interface BalanceSummaryProps {
  balances: GroupBalances
  currentUserId: string
}

export function BalanceSummary({ balances, currentUserId }: BalanceSummaryProps) {
  // Find current user's balance
  const currentUserBalance = balances.balances.find(b => b.userId === currentUserId)

  // Find all creditors (positive balance = owed money) excluding current user
  const creditors = balances.balances.filter(b => b.balance > 0 && b.userId !== currentUserId)

  // Find all debtors (negative balance = owe money) excluding current user
  const debtors = balances.balances.filter(b => b.balance < 0 && b.userId !== currentUserId)

  // Build the detailed "You owe" message
  const getOweSummary = () => {
    if (!currentUserBalance) return null

    const userBalance = currentUserBalance.balance

    if (userBalance < 0 && creditors.length > 0) {
      // User owes money - show each creditor
      const parts = creditors.map(c => `${c.displayName} ${formatCurrency(c.balance)}`)
      const message = parts.length === 1
        ? `You owe ${parts[0]}`
        : `You owe ${parts.join(' and ')}`

      return {
        message,
        isNegative: true,
        isSettled: false,
      }
    } else if (userBalance > 0 && debtors.length > 0) {
      // User is owed money - show each debtor
      const parts = debtors.map(d => `${d.displayName} owes you ${formatCurrency(Math.abs(d.balance))}`)
      const message = parts.length === 1
        ? parts[0]
        : parts.join(' and ')

      return {
        message,
        isNegative: false,
        isSettled: false,
      }
    } else {
      // Balanced
      return {
        message: 'All settled up!',
        isNegative: false,
        isSettled: true,
      }
    }
  }

  const oweSummary = getOweSummary()

  // Color logic: red for owing, green for owed, amber for settled
  const getStatusColor = () => {
    if (!oweSummary) return 'var(--settled)'
    if (oweSummary.isSettled) return 'var(--settled)'
    if (oweSummary.isNegative) return 'var(--negative)'
    return 'var(--positive)'
  }

  const statusColor = getStatusColor()

  return (
    <section className="glass overflow-hidden">
      {/* "You Owe" Hero Section - Large & Centered */}
      {oweSummary && (
        <div className="py-8 px-6 text-center border-b border-[var(--glass-border)]">
          <p
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: statusColor }}
          >
            {oweSummary.message}
          </p>
        </div>
      )}

      {/* Totals - Smaller, subdued */}
      <div className="px-4 py-3 border-b border-[var(--glass-border)] flex justify-center gap-8 bg-[rgba(255,255,255,0.03)]">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Total</p>
          <p className="text-base font-medium text-[var(--text-primary)]">
            {formatCurrency(balances.totalExpenses)}
          </p>
        </div>
        <div className="w-px bg-[var(--glass-border)]" />
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Fair Share</p>
          <p className="text-base font-medium text-[var(--text-primary)]">
            {formatCurrency(balances.fairSharePerPerson)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/person</span>
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        {balances.balances.map((balance) => (
          <BalanceCard key={balance.userId} balance={balance} />
        ))}
      </div>
    </section>
  )
}
