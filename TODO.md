# Simple Split - Progress

## Phase 1: Project Setup
- [x] Create Next.js project (TypeScript, Tailwind, App Router)
- [x] Define shared types (`types/index.ts`)
- [x] Create mock data (`lib/mock-data.ts`)
- [x] Create balance calculation (`lib/balance.ts`)
- [x] Create formatting utils (`lib/utils.ts`)

## Phase 2: Core UI + Balance Logic

### Components to build:

- [ ] `components/balances/balance-summary.tsx`
  - Props: `balances: GroupBalances`
  - Shows total expenses, fair share per person
  - Renders BalanceCard for each user

- [ ] `components/balances/balance-card.tsx`
  - Props: `balance: UserBalance`
  - Shows name, balance amount
  - Green if owed, red if owes

- [ ] `components/expenses/expense-form.tsx`
  - Props: `onSubmit`, `currentUserId`, `groupId`, optional `expense` for edit mode
  - Inputs: description (text), amount (number)
  - Client component with local state

- [ ] `components/expenses/expense-list.tsx`
  - Props: `expenses`, `currentUserId`, `users`, `onEdit`, `onDelete`
  - Maps expenses to ExpenseItem, sorted newest first

- [ ] `components/expenses/expense-item.tsx`
  - Props: `expense`, `payerName`, `isOwner`, `onEdit`, `onDelete`
  - Shows date, description, amount, payer
  - Edit/Delete buttons only if isOwner

- [ ] `app/page.tsx` - Main page
  - Client component with `useState` for expenses
  - Renders BalanceSummary, ExpenseForm, ExpenseList
  - Handlers: handleAddExpense, handleUpdateExpense, handleDeleteExpense

### Phase 2 success criteria:
- Balance summary displays at top
- Can add new expense via form
- Can edit/delete own expenses
- Expense log shows description, amount, payer, date
- Balances recalculate on changes

## Phase 3: Polish & UX Validation
- [ ] Form validation (amount > 0, description required)
- [ ] Empty state when no expenses
- [ ] Delete confirmation dialog
- [ ] Mobile responsive layout
- [ ] Test edge cases (single member, $0.01 amounts)

## Phase 4: Supabase Integration (Deferred)
- [ ] Create Supabase project
- [ ] Run database schema SQL
- [ ] Add RLS policies
- [ ] Add auth pages (login/signup)
- [ ] Replace mock data with server queries
- [ ] Convert handlers to server actions

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `types/index.ts` | `User`, `Expense`, `Group`, `UserBalance`, `GroupBalances` |
| `lib/mock-data.ts` | `CURRENT_USER`, `MOCK_USERS`, `INITIAL_EXPENSES` |
| `lib/balance.ts` | `calculateBalances(expenses, members)` |
| `lib/utils.ts` | `formatCurrency()`, `formatDate()` |
