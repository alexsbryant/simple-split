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
- [x] Show validation feedback on invalid input

### UX Improvements
- [x] Empty state when no expenses
- [x] Delete confirmation dialog
- [x] Mobile responsive tweaks

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

## Implementation Details

### Current Mock Data
- **Users**: You (user-1) + Casey (user-2)
- **Group**: "Household" (group-1)
- **Initial expenses**: Groceries ($45, You) + Dinner ($120, Casey)
- **Initial balances**: You owes Casey $37.50

### Architecture
- **State**: React `useState` in `app/page.tsx` (no external state library)
- **Balance calc**: Pure function `calculateBalances()` in `lib/balance.ts`
- **Styling**: CSS classes in `globals.css` (`.glass`, `.glass-sm`, `.glass-input`)
- **Form**: Description optional → uses `formatDateTime()` from `lib/utils.ts` if empty

### Component Structure
```
components/
├── balances/
│   ├── balance-summary.tsx  # Main balance display
│   └── balance-card.tsx     # Individual user balance
├── expenses/
│   ├── expense-form.tsx     # Add/edit form
│   ├── expense-list.tsx     # List container
│   └── expense-item.tsx     # Individual expense row
└── ui/
    ├── button.tsx           # Variants: primary/secondary/danger
    └── input.tsx            # Reusable input with label
```

---

## Key Files

| File | Purpose |
|------|---------|
| `types/index.ts` | Type definitions |
| `lib/mock-data.ts` | Mock users (You + Casey) |
| `lib/balance.ts` | `calculateBalances()` function |
| `lib/utils.ts` | `formatCurrency()`, `formatDate()`, `formatDateTime()` |
| `app/globals.css` | Frosted glass theme & colors |
| `app/page.tsx` | Main page component (state lives here) |
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

- Project location: `~/Projects/simple-split` (moved from iCloud Drive)
- Use `--webpack` flag if Turbopack causes issues: `npx next dev --webpack`
- Design reference: `design/screenshot_frost.PNG`


## NON-CLAUDE BRAINSTORMING SECTION START

*DO NOT DELETE WHEN UPDATING TODO.md - CLAUDE CAN RESPOND TO IDEAS IN THIS SECTION DURING PLAN MODE AND DISCUSS ITEMS WITH ME, BUT DO NOT EDIT OR DELETE*

- I see the app as being three pages

    1. Landing page - login / create account component and large Simple Split title.

    2. Dashboard / groups page - A simple table of groups available to user if any, with a button to create a 'new group'.

    3. The main Simple Split page that has been worked on already, showing the working Simple Split app, balance card with summary, expense form below, and expense list below that.

- Users create an account or log in, taken to a page with no groups, option to either create a split group or join a group.  If they select join they put in the email address or username of the person whos group they are trying to join.  Once a group is created, there is an option to add to group, and use either another user's username or their email address.  Invited users can join the group and will remain in the group.  They have the option to leave groups.  The creator has the option to remove users from groups.  

(Big question is how do we implement this?  Is this all dooable on Supabase?  When is the best time to create the UI for the landing / log-in page and groups page, following the main app's design?)




*NON-CLAUDE BRAINSTORMING SECTION ENDS*