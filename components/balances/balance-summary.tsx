'use client'

import { useState } from 'react'
import { GroupBalances } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { calculateSimplifiedDebts, isFullySettled } from '@/lib/balance'
import { BalanceCard } from './balance-card'
import { SettleUpButton } from '@/components/settlements/settle-up-button'
import { SettleUpModal } from '@/components/settlements/settle-up-modal'

interface BalanceSummaryProps {
  balances: GroupBalances
  currentUserId: string
  currency: string
  groupId: string
  onSettlementSuccess: () => void
}

export function BalanceSummary({
  balances,
  currentUserId,
  currency,
  groupId,
  onSettlementSuccess,
}: BalanceSummaryProps) {
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false)

  // Calculate simplified debts for settlement
  const simplifiedDebts = calculateSimplifiedDebts(balances.balances)
  const allSettled = isFullySettled(balances.balances)

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
      const parts = creditors.map(c => `${c.displayName} ${formatCurrency(c.balance, currency)}`)
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
      const parts = debtors.map(d => `${d.displayName} owes you ${formatCurrency(Math.abs(d.balance), currency)}`)
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
          {/* Settle Up button - only show when there are outstanding debts */}
          {!allSettled && (
            <div className="mt-4">
              <SettleUpButton onClick={() => setIsSettleModalOpen(true)} />
            </div>
          )}
        </div>
      )}

      {/* Totals - Smaller, subdued */}
      <div className="px-4 py-3 border-b border-[var(--glass-border)] flex justify-center gap-8 bg-[rgba(255,255,255,0.03)]">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Total</p>
          <p className="text-base font-medium text-[var(--text-primary)]">
            {formatCurrency(balances.totalExpenses, currency)}
          </p>
        </div>
        <div className="w-px bg-[var(--glass-border)]" />
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Fair Share</p>
          <p className="text-base font-medium text-[var(--text-primary)]">
            {formatCurrency(balances.fairSharePerPerson, currency)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/person</span>
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        {balances.balances.map((balance) => (
          <BalanceCard key={balance.userId} balance={balance} currency={currency} />
        ))}
      </div>

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        debts={simplifiedDebts}
        groupId={groupId}
        currency={currency}
        currentUserId={currentUserId}
        onSuccess={() => {
          onSettlementSuccess()
          setIsSettleModalOpen(false)
        }}
      />
    </section>
  )
}
