import { Expense, User, GroupBalances, UserBalance, SimplifiedDebt } from '@/types'

/**
 * Calculates balances for all members in a group based on expenses.
 * Pure function - no side effects.
 *
 * Balance calculation:
 * - totalExpenses = sum of regular expenses only (excludes settlements)
 * - fairShare = totalExpenses / memberCount
 * - userBalance = userTotalPaid - fairShare
 *   - positive = user is owed money
 *   - negative = user owes money
 *
 * Settlements:
 * - Do NOT count toward totalExpenses (they're transfers, not shared costs)
 * - Increase payer's "paid" amount (they gave money)
 * - Decrease recipient's "paid" amount (they received money)
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

  // Sum only regular expenses (not settlements) for the total
  const totalExpenses = expenses
    .filter((exp) => !exp.isSettlement)
    .reduce((sum, exp) => sum + exp.amount, 0)
  const fairSharePerPerson = totalExpenses / memberCount

  // Calculate how much each person paid
  const paidByUser: Record<string, number> = {}
  expenses.forEach((exp) => {
    if (exp.isSettlement && exp.settledWithUserId) {
      // Settlement: payer gave money to recipient
      // Payer's effective "paid" increases (they contributed toward their debt)
      paidByUser[exp.paidByUserId] =
        (paidByUser[exp.paidByUserId] || 0) + exp.amount
      // Recipient's effective "paid" decreases (they received money back)
      paidByUser[exp.settledWithUserId] =
        (paidByUser[exp.settledWithUserId] || 0) - exp.amount
    } else {
      // Regular expense
      paidByUser[exp.paidByUserId] =
        (paidByUser[exp.paidByUserId] || 0) + exp.amount
    }
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

/**
 * Debt Simplification Algorithm
 *
 * Given user balances, calculates the minimum number of transactions
 * needed to settle all debts.
 *
 * Algorithm:
 * 1. Separate users into creditors (balance > 0) and debtors (balance < 0)
 * 2. Sort creditors descending, debtors ascending (by absolute value)
 * 3. Match largest creditor with largest debtor
 * 4. Create transaction for min(creditor.balance, |debtor.balance|)
 * 5. Update balances, repeat until all settled
 */
export function calculateSimplifiedDebts(
  balances: UserBalance[]
): SimplifiedDebt[] {
  const EPSILON = 0.01

  // Clone and separate into creditors (owed money) and debtors (owe money)
  const creditors = balances
    .filter((b) => b.balance > EPSILON)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance)

  const debtors = balances
    .filter((b) => b.balance < -EPSILON)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance) // Most negative first

  const debts: SimplifiedDebt[] = []

  let creditorIdx = 0
  let debtorIdx = 0

  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx]
    const debtor = debtors[debtorIdx]

    // How much can be settled in this transaction
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance))

    if (amount > EPSILON) {
      debts.push({
        fromUserId: debtor.userId,
        fromDisplayName: debtor.displayName,
        toUserId: creditor.userId,
        toDisplayName: creditor.displayName,
        amount: Math.round(amount * 100) / 100,
      })
    }

    // Update running balances
    creditor.balance -= amount
    debtor.balance += amount

    // Move to next creditor/debtor if settled
    if (creditor.balance < EPSILON) creditorIdx++
    if (debtor.balance > -EPSILON) debtorIdx++
  }

  return debts
}

/**
 * Check if all balances are settled (within rounding tolerance)
 */
export function isFullySettled(balances: UserBalance[]): boolean {
  const EPSILON = 0.01
  return balances.every((b) => Math.abs(b.balance) < EPSILON)
}
