'use client'

import { useState } from 'react'
import { SimplifiedDebt } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getVenmoLink, getPayPalLink, openPaymentLink } from '@/lib/payment-links'
import { createSettlement } from '@/app/actions/settlements'
import { Button } from '@/components/ui/button'

interface SettleUpModalProps {
  isOpen: boolean
  onClose: () => void
  debts: SimplifiedDebt[]
  groupId: string
  currency: string
  currentUserId: string
  onSuccess: () => void
}

export function SettleUpModal({
  isOpen,
  onClose,
  debts,
  groupId,
  currency,
  currentUserId,
  onSuccess,
}: SettleUpModalProps) {
  const [settlingDebtId, setSettlingDebtId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Separate user's debts from others
  const userDebts = debts.filter(
    (d) => d.fromUserId === currentUserId || d.toUserId === currentUserId
  )
  const otherDebts = debts.filter(
    (d) => d.fromUserId !== currentUserId && d.toUserId !== currentUserId
  )

  const isAllSettled = debts.length === 0

  const handleSettleDebt = async (debt: SimplifiedDebt) => {
    const debtId = `${debt.fromUserId}-${debt.toUserId}`
    setSettlingDebtId(debtId)
    setError(null)

    const result = await createSettlement({
      groupId,
      payerUserId: debt.fromUserId,
      recipientUserId: debt.toUserId,
      amount: debt.amount,
    })

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Failed to create settlement')
    }

    setSettlingDebtId(null)
  }

  const getDebtMessage = (debt: SimplifiedDebt) => {
    if (debt.fromUserId === currentUserId) {
      return `You pay ${debt.toDisplayName}`
    } else if (debt.toUserId === currentUserId) {
      return `${debt.fromDisplayName} pays you`
    } else {
      return `${debt.fromDisplayName} pays ${debt.toDisplayName}`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col rounded-3xl border-[1.5px] border-[var(--border-default)] shadow-2xl bg-[var(--bg-card)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Settle Up</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white cursor-pointer p-1"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--negative)] text-sm text-[var(--negative)]">
              {error}
            </div>
          )}

          {isAllSettled ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">
                <svg
                  className="w-12 h-12 mx-auto text-[var(--settled)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-[var(--settled)]">
                All settled up!
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                No outstanding debts in this group
              </p>
            </div>
          ) : (
            <>
              {/* User's debts */}
              {userDebts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Your Settlements
                  </h3>
                  <div className="space-y-2">
                    {userDebts.map((debt) => {
                      const debtId = `${debt.fromUserId}-${debt.toUserId}`
                      const isSettling = settlingDebtId === debtId
                      const isUserPayer = debt.fromUserId === currentUserId
                      const showVenmo = isUserPayer && currency === 'USD'
                      const showPayPal = isUserPayer

                      return (
                        <div
                          key={debtId}
                          className="p-3 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {getDebtMessage(debt)}
                              </p>
                              <p className="text-lg font-semibold text-[var(--accent)]">
                                {formatCurrency(debt.amount, currency)}
                              </p>
                            </div>
                          </div>

                          {/* Payment buttons row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {showVenmo && (
                              <button
                                onClick={() => openPaymentLink(getVenmoLink(debt.amount, `SimpleSplit: ${debt.toDisplayName}`))}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#008CFF] text-white hover:brightness-110 transition-all cursor-pointer"
                              >
                                Venmo
                              </button>
                            )}
                            {showPayPal && (
                              <button
                                onClick={() => openPaymentLink(getPayPalLink(debt.amount, currency))}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#0070BA] text-white hover:brightness-110 transition-all cursor-pointer"
                              >
                                PayPal
                              </button>
                            )}
                            <div className="flex-1" />
                            <Button
                              variant="secondary"
                              onClick={() => handleSettleDebt(debt)}
                              disabled={isSettling}
                              className="shrink-0 px-3 py-2 text-xs"
                            >
                              {isSettling ? '...' : 'Mark as Paid'}
                            </Button>
                          </div>

                          {/* Helper text for payers */}
                          {isUserPayer && (
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                              Pay via app, then mark as paid
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Other debts */}
              {otherDebts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Other Settlements
                  </h3>
                  <div className="space-y-2">
                    {otherDebts.map((debt) => {
                      const debtId = `${debt.fromUserId}-${debt.toUserId}`
                      const isSettling = settlingDebtId === debtId
                      return (
                        <div
                          key={debtId}
                          className="p-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {getDebtMessage(debt)}
                            </p>
                            <p className="text-lg font-semibold text-[var(--accent)]">
                              {formatCurrency(debt.amount, currency)}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => handleSettleDebt(debt)}
                            disabled={isSettling}
                            className="shrink-0 px-3 py-2 text-xs"
                          >
                            {isSettling ? '...' : 'Mark Paid'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isAllSettled && (
          <div className="p-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)] text-center">
              Settling records payments between members
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
