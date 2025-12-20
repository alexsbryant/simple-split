import { User, Expense, Group } from '@/types'

// Mock current user (simulates logged-in user)
export const CURRENT_USER: User = {
  id: 'user-1',
  email: 'you@example.com',
  displayName: 'You',
}

// Mock group members
export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'user-2', email: 'casey@example.com', displayName: 'Casey' },
]

// Single default group
export const MOCK_GROUP: Group = {
  id: 'group-1',
  name: 'Household',
  createdAt: new Date().toISOString(),
}

// Initial mock expenses
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    groupId: 'group-1',
    paidByUserId: 'user-1',
    amount: 45.0,
    description: 'Groceries',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'exp-2',
    groupId: 'group-1',
    paidByUserId: 'user-2',
    amount: 120.0,
    description: 'Dinner',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
]
