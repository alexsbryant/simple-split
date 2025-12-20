# Simple Split - Progress & Plan

> **Approach:** UI-first with mocked data. Validate UX before integrating Supabase.

---

## Phase 1: Project Setup — COMPLETE ✓

- Next.js 16.1.0 (TypeScript, Tailwind, App Router)
- Types, mock data, balance calculation, formatting utils
- GitHub: https://github.com/alexsbryant/simple-split

---

## Phase 2: Core UI + Balance Logic — COMPLETE ✓

All core functionality working:
- [x] Balance summary displays with color-coded user balances
- [x] Add new expenses via form
- [x] Edit own expenses
- [x] Delete own expenses
- [x] Balances update in real-time after changes

---

## Phase 3: Polish & UX — CURRENT

### UI Refinements
- [ ] Update mock users: You + Casey (2 users only)
- [ ] Visual polish based on design inspiration
- [ ] Tighten spacing, typography, and color usage

### Form & Validation
- [ ] Require description (non-empty)
- [ ] Require amount > 0
- [ ] Show validation feedback

### UX Improvements
- [ ] Empty state when no expenses
- [ ] Delete confirmation dialog
- [ ] Mobile responsive tweaks

### Testing
- [ ] Manual test all CRUD operations
- [ ] Test edge cases (zero amounts, long descriptions)
- [ ] Verify balance calculations

---

## Phase 4: Supabase Integration — DEFERRED

**Do not start until Phase 3 is validated.**

- Create Supabase project
- Run database schema
- Add RLS policies
- Add auth (login/signup)
- Replace useState with server queries
- Convert handlers to server actions

---

## Key Files

| File | Purpose |
|------|---------|
| `types/index.ts` | Type definitions |
| `lib/mock-data.ts` | Mock users, group, expenses |
| `lib/balance.ts` | `calculateBalances()` function |
| `lib/utils.ts` | Formatting utilities |
| `app/page.tsx` | Main page component |
| `components/` | UI components |

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```
