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

## Phase 3: Polish & UX — IN PROGRESS

### UI Refinements ✓
- [x] Update mock users: You + Casey (2 users only)
- [x] Frosted glass UI redesign (backdrop-blur, translucent cards)
- [x] Gradient background (purple/teal/brown)
- [x] Pill-shaped inputs and buttons
- [x] Softer status colors (muted green/red/amber)
- [x] Sans-serif throughout (Bodoni only for title)

### Form & Validation
- [x] Description optional (uses date/time if empty)
- [x] Amount > 0 required
- [ ] Show validation feedback on invalid input

### UX Improvements
- [x] Empty state when no expenses
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
| `lib/mock-data.ts` | Mock users (You + Casey) |
| `lib/balance.ts` | `calculateBalances()` function |
| `lib/utils.ts` | Formatting utilities |
| `app/globals.css` | Frosted glass theme & colors |
| `app/page.tsx` | Main page component |
| `components/` | UI components |
| `design/` | Design reference screenshots |

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```

---

## Notes

- Project moved from iCloud Drive to `~/Projects/simple-split` (Turbopack issues with iCloud)
- Use `--webpack` flag if Turbopack causes issues: `npx next dev --webpack`
