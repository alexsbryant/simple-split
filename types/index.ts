// Core types matching future Supabase schema

export type User = {
  id: string
  email: string
  displayName: string
}

export type ExpenseSplit = {
  id: string
  expenseId: string
  userId: string
  amount: number
}

export type ExpenseReaction = {
  id: string
  expenseId: string
  userId: string
  emoji: string
  createdAt: string
}

export type ExpenseComment = {
  id: string
  expenseId: string
  userId: string
  content: string
  createdAt: string
}

export type Expense = {
  id: string
  groupId: string
  paidByUserId: string
  amount: number
  description: string
  createdAt: string // ISO string
  updatedAt: string
  isSettlement: boolean
  settledWithUserId: string | null
  splits?: ExpenseSplit[] // Optional - only present for custom splits
  reactions?: ExpenseReaction[] // Emoji reactions on this expense
  commentCount?: number // Number of comments (fetched as aggregate)
}

export type Group = {
  id: string
  name: string
  currency: string
  createdAt: string
}

export type GroupMember = {
  groupId: string
  userId: string
}

// Computed types for UI

export type UserBalance = {
  userId: string
  displayName: string
  totalPaid: number
  fairShare: number
  balance: number // positive = owed money, negative = owes money
}

export type GroupBalances = {
  totalExpenses: number
  memberCount: number
  fairSharePerPerson: number
  balances: UserBalance[]
  settlementPeriodCutoff?: Date | null
}

// Invitation types for Phase 9A
export type InvitationStatus = 'pending' | 'accepted' | 'declined'

export type Invitation = {
  id: string
  groupId: string
  invitedByUserId: string
  invitedEmail: string
  status: InvitationStatus
  createdAt: string
  respondedAt: string | null
}

// Extended type with related data for UI display
export type InvitationWithDetails = Invitation & {
  groupName: string
  inviterName: string
}

// Settlement types for Phase 14A
export type SimplifiedDebt = {
  fromUserId: string
  fromDisplayName: string
  toUserId: string
  toDisplayName: string
  amount: number
}
