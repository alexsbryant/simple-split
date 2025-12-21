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

## Phase 3: Polish & UX — COMPLETE ✓

### UI Refinements ✓
- [x] Update mock users: You + Casey (2 users only)
- [x] Frosted glass UI redesign (backdrop-blur, translucent cards)
- [x] Gradient background (purple/teal/brown)
- [x] Pill-shaped inputs and buttons
- [x] Softer status colors (muted green/red/amber)
- [x] Sans-serif throughout (Bodoni only for title)

### Form & Validation ✓
- [x] Description optional (uses date/time if empty)
- [x] Amount > 0 required
- [x] Show validation feedback on invalid input

### UX Improvements ✓
- [x] Empty state when no expenses
- [x] Delete confirmation dialog (using window.confirm)
- [x] Mobile responsive tweaks (vertical stack on <768px)
- [x] Fix number overflow for large amounts (7+ digits)

### Testing
Manual testing completed for core CRUD operations. Edge cases verified:
- ✓ Invalid amounts show validation errors
- ✓ Large numbers (7+ digits) don't overflow containers
- ✓ Mobile layout stacks properly
- ✓ Delete confirmation prevents accidental deletions

---

## Phase 3.5: Multi-Page Structure — COMPLETE ✓

**Goal:** Build page shells for landing, groups dashboard, and split page.

### Pages Created
- [x] Landing page at `/` (centered title, auth buttons)
- [x] Groups dashboard at `/groups` (mock groups list)
- [x] Simple Split page moved to `/groups/[groupId]`
- [x] Navigation component with conditional buttons

### Navigation Features
- [x] "Simple Split" logo links to `/groups`
- [x] "Back to Groups" button (only on split page)
- [x] "Log out" button (placeholder, shown on all pages except landing)
- [x] No nav on landing page (clean centered design)

### Current Route Structure
```
/                    → Landing page
/groups              → Groups dashboard
/groups/[groupId]    → Simple Split page
```

---

## Phase 4: Supabase Integration — NEXT PHASE

**Prerequisites:**
- ✓ UI validated with mock data
- ✓ Multi-page structure in place
- ✓ Component architecture ready for server data

**Tasks:**
- [ ] Create Supabase project
- [ ] Design and run database schema (users, groups, expenses, group_members)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Implement authentication (login/signup)
- [ ] Convert mock data loading to Supabase queries
- [ ] Convert client handlers to server actions
- [ ] Add group creation and management
- [ ] Add user invitations and group membership

---

## Architecture

### Data Flow (Current - Mock Data)
```
Server Component (page.tsx)
  ↓ loads mock data
Client Component (split-page.tsx)
  ↓ manages state (useState)
  ↓ handles CRUD operations
  ↓ calculates balances
  → renders UI components
```

### Data Flow (Future - Supabase)
```
Server Component (page.tsx)
  ↓ async fetch from Supabase
Client Component (split-page.tsx)
  ↓ receives initial data as props
  ↓ optimistic updates with state
  → Server Actions for mutations
  → Supabase real-time subscriptions
```

### Key Architectural Decisions

**1. Data Loading Separation** (Completed)
- Server Components load data (currently mock, future: Supabase)
- Client Components handle interactivity and state
- Clear separation enables easy Supabase integration

**2. Mock Data Strategy**
- `lib/mock-data.ts` contains: CURRENT_USER, MOCK_USERS, MOCK_GROUP, INITIAL_EXPENSES
- Mock groups in `app/groups/page.tsx`: Household, Vacation Trip
- All data passed as props to client components

**3. State Management**
- React `useState` in `split-page.tsx` (no external state library)
- Balances calculated on each render via `calculateBalances()`
- Form state managed locally in components

---

## Component Structure

```
app/
├── page.tsx                      # Landing page (server component)
├── groups/
│   ├── page.tsx                  # Groups dashboard (server component)
│   └── [groupId]/
│       └── page.tsx              # Split page wrapper (server component)
├── globals.css                   # Frosted glass theme & colors
└── layout.tsx                    # Root layout

components/
├── split-page.tsx                # Main split page logic (client component)
├── nav.tsx                       # Navigation with conditional buttons
├── balances/
│   ├── balance-summary.tsx       # Main balance display
│   └── balance-card.tsx          # Individual user balance
├── expenses/
│   ├── expense-form.tsx          # Add/edit form with validation
│   ├── expense-list.tsx          # List container
│   └── expense-item.tsx          # Individual expense row
└── ui/
    ├── button.tsx                # Variants: primary/secondary/danger
    └── input.tsx                 # Reusable input with label & error display

lib/
├── mock-data.ts                  # Mock users, groups, expenses
├── balance.ts                    # calculateBalances() pure function
└── utils.ts                      # formatCurrency, formatDate, formatDateTime

types/
└── index.ts                      # TypeScript type definitions
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with auth buttons |
| `app/groups/page.tsx` | Groups dashboard with mock groups |
| `app/groups/[groupId]/page.tsx` | Wrapper for split page (loads data) |
| `components/split-page.tsx` | Main split page UI + logic (client) |
| `components/nav.tsx` | Navigation with conditional buttons |
| `types/index.ts` | Type definitions (User, Expense, Group, etc.) |
| `lib/mock-data.ts` | Mock users, groups, and expenses |
| `lib/balance.ts` | `calculateBalances()` pure function |
| `lib/utils.ts` | Formatting utilities |
| `app/globals.css` | Frosted glass theme, colors, CSS variables |

---

## Recent Changes (Session Context)

### Session Summary
1. ✅ Completed Phase 3 UX improvements (validation, delete confirmation, mobile responsive)
2. ✅ Refactored for Supabase readiness (separated data loading from UI logic)
3. ✅ Built multi-page structure (landing, groups, split pages)
4. ✅ Added navigation with conditional buttons
5. ✅ Fixed number overflow for large amounts

### Latest Commits
- `b5dbf95` - Add Nav enhancements and fix number overflow
- `f9e5c19` - Build page shells for multi-page structure
- `3986bb8` - Complete Phase 3 + refactor for Supabase preparation

### What's Ready for Next Session
- ✅ All UI components built and tested
- ✅ Multi-page routing structure in place
- ✅ Mock data flow established
- ✅ Component architecture ready for server data
- ✅ Navigation working with conditional buttons

### Next Steps
The app is ready for Supabase integration. The refactored architecture makes this straightforward:
1. Set up Supabase project and schema
2. Replace mock data imports with Supabase queries in server components
3. Convert client mutations to server actions
4. Add authentication (the UI shells are already in place)
5. Implement group creation and management features

---

## Testing Guide

### Navigation Flow
1. Visit `/` - see landing page (no nav)
2. Click "Log in" or "Create account" → `/groups`
3. See groups list with nav at top (with "Log out" button)
4. Click "Household" → `/groups/group-1`
5. See Simple Split page with nav ("Simple Split" logo + "Back to Groups" + "Log out")
6. Click "Back to Groups" → returns to `/groups`

### Split Page CRUD Operations
1. Add new expense: "Coffee" $15
2. Verify balances changed
3. Edit the Coffee expense to $20
4. Verify balances updated
5. Try to add expense with $0 - see validation error
6. Type valid amount - error clears
7. Delete Coffee expense - confirm dialog appears
8. Cancel delete - expense stays
9. Delete again and confirm - expense removed
10. Add expense with no description - timestamp auto-fills

### Responsive Design
1. Resize browser to 375px (mobile)
2. Verify expense items stack vertically
3. Verify nav is usable on mobile
4. Verify buttons are tappable

### Number Overflow Test
1. Add expense with large amount: $1,234,567.89
2. Verify amount displays fully without overflow
3. Check both expense list and balance cards

---

## Commands

```bash
npm run dev      # localhost:3001 (or 3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```

---

## Notes

- Project location: `~/Projects/simple-split` (moved from iCloud Drive)
- Use `--webpack` flag if Turbopack causes issues: `npx next dev --webpack`
- Design reference: `design/screenshot_frost.PNG`
- Dev server usually runs on port 3001 (3000 often occupied)


## NON-CLAUDE BRAINSTORMING SECTION START

*DO NOT DELETE WHEN UPDATING TODO.md - CLAUDE CAN RESPOND TO IDEAS IN THIS SECTION DURING PLAN MODE AND DISCUSS ITEMS WITH ME, BUT DO NOT EDIT OR DELETE*

- I see the app as being three pages

    1. Landing page - login / create account component and large Simple Split title.

    2. Dashboard / groups page - A simple table of groups available to user if any, with a button to create a 'new group'.

    3. The main Simple Split page that has been worked on already, showing the working Simple Split app, balance card with summary, expense form below, and expense list below that.

- Users create an account or log in, taken to a page with no groups, option to either create a split group or join a group.  If they select join they put in the email address or username of the person whos group they are trying to join.  Once a group is created, there is an option to add to group, and use either another user's username or their email address.  Invited users can join the group and will remain in the group.  They have the option to leave groups.  The creator has the option to remove users from groups.

(Big question is how do we implement this?  Is this all dooable on Supabase?  When is the best time to create the UI for the landing / log-in page and groups page, following the main app's design?)




*NON-CLAUDE BRAINSTORMING SECTION ENDS*
