import { Expense, User, GroupBalances, UserBalance } from '@/types'

/**
 * Calculates balances for all members in a group based on expenses.
 * Pure function - no side effects.
 *
 * Balance calculation:
 * - totalExpenses = sum of all expenses
 * - fairShare = totalExpenses / memberCount
 * - userBalance = userTotalPaid - fairShare
 *   - positive = user is owed money
 *   - negative = user owes money
 */
export function calculateBalances(
  expenses: Expense[],
  members: User[]
): GroupBalances {
  const memberCount = members.length

  if (memberCount === 0) {
    return {
      totalExpenses: 0,
      memberCount: 0,
      fairSharePerPerson: 0,
      balances: [],
    }
  }

  // Sum all expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const fairSharePerPerson = totalExpenses / memberCount

  // Calculate how much each person paid
  const paidByUser: Record<string, number> = {}
  expenses.forEach((exp) => {
    paidByUser[exp.paidByUserId] =
      (paidByUser[exp.paidByUserId] || 0) + exp.amount
  })

  // Build balance for each member
  const balances: UserBalance[] = members.map((member) => {
    const totalPaid = paidByUser[member.id] || 0
    const balance = totalPaid - fairSharePerPerson

    return {
      userId: member.id,
      displayName: member.displayName,
      totalPaid: Math.round(totalPaid * 100) / 100,
      fairShare: Math.round(fairSharePerPerson * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    }
  })

  // Sort: those owed money first (highest balance)
  balances.sort((a, b) => b.balance - a.balance)

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    memberCount,
    fairSharePerPerson: Math.round(fairSharePerPerson * 100) / 100,
    balances,
  }
}
