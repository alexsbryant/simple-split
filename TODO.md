# Simple Split - Progress & Plan

> **Approach:** UI-first with mocked data. Validate UX before integrating Supabase.

## Phase 1: Project Setup - COMPLETE

### What was done:
- [x] Created Next.js 16.1.0 project (TypeScript, Tailwind CSS, App Router)
- [x] Defined shared types in `types/index.ts`
- [x] Created mock data in `lib/mock-data.ts` (3 users, 1 group, 2 sample expenses)
- [x] Implemented balance calculation in `lib/balance.ts`
- [x] Created formatting utils in `lib/utils.ts`
- [x] Linked to GitHub: https://github.com/alexsbryant/simple-split

### What's working:
- Dev server runs: `npm run dev` → http://localhost:3000
- TypeScript compiles with no errors
- All types are defined and ready for use
- `calculateBalances()` is a pure function ready to be called

---

## Phase 2: Core UI + Balance Logic - NEXT UP

### Goal:
Build working UI with mocked data. After this phase:
- Balance summary displays at top of page
- Can add, edit, delete expenses
- Balances recalculate automatically

### Components to build (in order):

#### 1. `components/balances/balance-card.tsx`
```typescript
type Props = {
  balance: UserBalance
}
```
- Shows user name and balance amount
- Green styling if positive (owed money), red if negative (owes money)

#### 2. `components/balances/balance-summary.tsx`
```typescript
type Props = {
  balances: GroupBalances
}
```
- Shows total expenses and fair share per person
- Maps `balances.balances` to render `BalanceCard` for each user

#### 3. `components/expenses/expense-item.tsx`
```typescript
type Props = {
  expense: Expense
  payerName: string
  isOwner: boolean
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}
```
- Shows date, description, amount, payer name
- Edit/Delete buttons only if `isOwner === true`

#### 4. `components/expenses/expense-list.tsx`
```typescript
type Props = {
  expenses: Expense[]
  currentUserId: string
  users: User[]
  onEdit: (id: string, updates: Partial<Expense>) => void
  onDelete: (id: string) => void
}
```
- Sort expenses by `createdAt` (newest first)
- Look up payer name from `users` array
- Determine `isOwner` by comparing `expense.paidByUserId === currentUserId`

#### 5. `components/expenses/expense-form.tsx`
```typescript
type Props = {
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  currentUserId: string
  groupId: string
  editingExpense?: Expense  // Optional: for edit mode
  onCancelEdit?: () => void
}
```
- Client component (`'use client'`)
- Two inputs: description (text), amount (number)
- On submit: call `onSubmit` with `{ groupId, paidByUserId: currentUserId, amount, description }`
- If `editingExpense` provided, pre-fill form and show Cancel button

#### 6. `app/page.tsx` - Main page
- Client component with `useState<Expense[]>(INITIAL_EXPENSES)`
- Import from `@/lib/mock-data`: `MOCK_USERS`, `CURRENT_USER`, `INITIAL_EXPENSES`
- Call `calculateBalances(expenses, MOCK_USERS)` on each render
- Implement handlers:
  - `handleAddExpense`: generate ID with `exp-${Date.now()}`, add timestamps
  - `handleUpdateExpense`: update expense in array by ID
  - `handleDeleteExpense`: filter expense out of array
- Render: `<BalanceSummary>`, `<ExpenseForm>`, `<ExpenseList>`

### Phase 2 success criteria:
- [ ] Balance summary shows at top with all 3 mock users
- [ ] Each user's balance displays correctly (You: -$10, Alex: +$65, Sam: -$55)
- [ ] Can add new expense via form
- [ ] New expense appears in list immediately
- [ ] Can edit own expenses (only "You" expenses have edit button)
- [ ] Can delete own expenses
- [ ] Balances update after any change

---

## Phase 3: Polish & UX Validation

- [ ] Form validation (amount > 0, description required)
- [ ] Empty state when no expenses
- [ ] Delete confirmation
- [ ] Mobile responsive layout
- [ ] Test edge cases

---

## Phase 4: Supabase Integration (Deferred)

**Do not start until Phase 3 is validated.**

- [ ] Create Supabase project at supabase.com
- [ ] Run database schema (see `.claude/plans/` for SQL)
- [ ] Add RLS policies
- [ ] Add auth (login/signup pages)
- [ ] Replace `useState` with server queries
- [ ] Convert handlers to server actions

---

## Key Files Reference

| File | Contents |
|------|----------|
| `types/index.ts` | `User`, `Expense`, `Group`, `UserBalance`, `GroupBalances` types |
| `lib/mock-data.ts` | `CURRENT_USER` (id: 'user-1'), `MOCK_USERS` (3 users), `INITIAL_EXPENSES` (2 expenses) |
| `lib/balance.ts` | `calculateBalances(expenses, members)` → `GroupBalances` |
| `lib/utils.ts` | `formatCurrency(amount)`, `formatDate(isoString)`, `formatDateTime(isoString)` |

## Mock Data Details

```
CURRENT_USER: { id: 'user-1', displayName: 'You' }
MOCK_USERS: [
  { id: 'user-1', displayName: 'You' },
  { id: 'user-2', displayName: 'Alex' },
  { id: 'user-3', displayName: 'Sam' }
]
INITIAL_EXPENSES: [
  { id: 'exp-1', paidByUserId: 'user-1', amount: 45, description: 'Groceries' },
  { id: 'exp-2', paidByUserId: 'user-2', amount: 120, description: 'Dinner' }
]
```

**Expected initial balances (total: $165, fair share: $55 each):**
- Alex: +$65 (paid $120, owes $55 → owed $65)
- You: -$10 (paid $45, owes $55 → owes $10)
- Sam: -$55 (paid $0, owes $55)

---

## Commands

```bash
cd "/Users/alexanderbryant/Library/Mobile Documents/com~apple~CloudDocs/Coding/Projects/simple-split"
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without emitting
```

---

## Decisions Made

1. **UI-first approach**: Build and validate UI with mock data before adding Supabase
2. **No localStorage**: Mock data lives in memory, easy to swap for real DB later
3. **Single group assumed**: No group switching UI for v1
4. **Profiles table deferred**: Using simple `User` type with `displayName` for now
5. **Components receive data via props**: No fetching inside components
6. **Balance calculation is pure**: `calculateBalances()` has no side effects
