import { Expense, User, GroupBalances, UserBalance, SimplifiedDebt } from '@/types'

/**
 * Finds the most recent settlement that completed a settlement period
 * (i.e., all balances were within tolerance of $0 after it).
 *
 * Returns the settlement's createdAt date, or null if no complete period found.
 */
function findSettlementPeriodCutoff(
  expenses: Expense[],
  members: User[]
): Date | null {
  const TOLERANCE = 0.10 // $0.10 tolerance for "settled"

  // Find all settlements, newest first
  const settlements = expenses
    .filter(exp => exp.isSettlement)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // For each settlement, check if balances were near 0 after it
  for (const settlement of settlements) {
    // Get all expenses up to and including this settlement
    const expensesUpToSettlement = expenses.filter(
      exp => new Date(exp.createdAt) <= new Date(settlement.createdAt)
    )

    // Calculate how much each person paid AND what they owe
    const paidByUser: Record<string, number> = {}
    const owedByUser: Record<string, number> = {}

    members.forEach((m) => {
      paidByUser[m.id] = 0
      owedByUser[m.id] = 0
    })

    expensesUpToSettlement.forEach((exp) => {
      if (exp.isSettlement && exp.settledWithUserId) {
        paidByUser[exp.paidByUserId] = (paidByUser[exp.paidByUserId] || 0) + exp.amount
        paidByUser[exp.settledWithUserId] = (paidByUser[exp.settledWithUserId] || 0) - exp.amount
      } else {
        paidByUser[exp.paidByUserId] = (paidByUser[exp.paidByUserId] || 0) + exp.amount

        // Determine what each member owes for this expense
        if (exp.splits && exp.splits.length > 0) {
          exp.splits.forEach((split) => {
            owedByUser[split.userId] = (owedByUser[split.userId] || 0) + split.amount
          })
        } else {
          const perPersonShare = exp.amount / members.length
          members.forEach((m) => {
            owedByUser[m.id] = (owedByUser[m.id] || 0) + perPersonShare
          })
        }
      }
    })

    // Check if all members have balances within tolerance
    const allNearZero = members.every((member) => {
      const totalPaid = paidByUser[member.id] || 0
      const totalOwed = owedByUser[member.id] || 0
      const balance = totalPaid - totalOwed
      return Math.abs(balance) <= TOLERANCE
    })

    if (allNearZero) {
      return new Date(settlement.createdAt)
    }
  }

  return null // No complete settlement period found
}

/**
 * Calculates balances for all members in a group based on expenses.
 * Pure function - no side effects.
 *
 * Balance calculation:
 * - totalExpenses = sum of regular expenses only (excludes settlements)
 * - For each expense:
 *   - If custom splits exist: use them to determine each user's share
 *   - Otherwise: split equally among all members
 * - userBalance = userTotalPaid - userTotalOwed
 *   - positive = user is owed money
 *   - negative = user owes money
 *
 * Settlements:
 * - Do NOT count toward totalExpenses (they're transfers, not shared costs)
 * - Increase payer's "paid" amount (they gave money)
 * - Decrease recipient's "paid" amount (they received money)
 *
 * Settlement Periods:
 * - After a settlement brings all balances to ~$0, that marks the end of a period
 * - Only expenses after that period count toward totalExpenses
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
      settlementPeriodCutoff: null,
    }
  }

  // Find the most recent settlement that completed a period (all balances ~$0)
  const settlementPeriodCutoff = findSettlementPeriodCutoff(expenses, members)

  // Sum only regular expenses (not settlements) after the cutoff
  const totalExpenses = expenses
    .filter((exp) =>
      !exp.isSettlement &&
      (!settlementPeriodCutoff || new Date(exp.createdAt) > settlementPeriodCutoff)
    )
    .reduce((sum, exp) => sum + exp.amount, 0)
  const fairSharePerPerson = totalExpenses / memberCount

  // Calculate how much each person paid AND what they owe
  const paidByUser: Record<string, number> = {}
  const owedByUser: Record<string, number> = {}

  // Initialize all members
  members.forEach((m) => {
    paidByUser[m.id] = 0
    owedByUser[m.id] = 0
  })

  expenses
    .filter((exp) =>
      !settlementPeriodCutoff || new Date(exp.createdAt) > settlementPeriodCutoff
    )
    .forEach((exp) => {
      if (exp.isSettlement && exp.settledWithUserId) {
        // Settlement: payer gave money to recipient
        // Payer's effective "paid" increases (they contributed toward their debt)
        paidByUser[exp.paidByUserId] =
          (paidByUser[exp.paidByUserId] || 0) + exp.amount
        // Recipient's effective "paid" decreases (they received money back)
        paidByUser[exp.settledWithUserId] =
          (paidByUser[exp.settledWithUserId] || 0) - exp.amount
      } else {
        // Regular expense - payer paid the amount
        paidByUser[exp.paidByUserId] =
          (paidByUser[exp.paidByUserId] || 0) + exp.amount

        // Determine what each member owes for this expense
        if (exp.splits && exp.splits.length > 0) {
          // Custom splits: use specified amounts
          exp.splits.forEach((split) => {
            owedByUser[split.userId] = (owedByUser[split.userId] || 0) + split.amount
          })
        } else {
          // Equal split: everyone owes equal share
          const perPersonShare = exp.amount / memberCount
          members.forEach((m) => {
            owedByUser[m.id] = (owedByUser[m.id] || 0) + perPersonShare
          })
        }
      }
    })

  // Build balance for each member
  // Balance = totalPaid - totalOwed
  const balances: UserBalance[] = members.map((member) => {
    const totalPaid = paidByUser[member.id] || 0
    const totalOwed = owedByUser[member.id] || 0
    const balance = totalPaid - totalOwed

    return {
      userId: member.id,
      displayName: member.displayName,
      totalPaid: Math.round(totalPaid * 100) / 100,
      fairShare: Math.round(totalOwed * 100) / 100, // Now represents actual owed amount
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
    settlementPeriodCutoff,
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
