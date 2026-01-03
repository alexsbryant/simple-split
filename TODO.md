# Settle - Progress & Plan

> **Approach:** UI-first with mocked data. Validate UX before integrating Supabase.

---

## Phase 1: Project Setup — COMPLETE ✓

- Next.js 16.1.0 (TypeScript, Tailwind, App Router)
- Types, mock data, balance calculation, formatting utils
- GitHub: https://github.com/alexsbryant/simple-split

---

## Phase 2: Core UI + Balance Logic — COMPLETE ✓

- Balance summary with color-coded user balances
- Add/edit/delete expenses via form
- Balances update in real-time

---

## Phase 3: Polish & UX — COMPLETE ✓

- Frosted glass UI, gradient background, pill-shaped inputs
- Form validation, delete confirmation, mobile responsive
- Number overflow fix for large amounts

---

## Phase 3.5: Multi-Page Structure — COMPLETE ✓

- Landing page `/`, Groups dashboard `/groups`, Split page `/groups/[groupId]`
- Navigation with conditional buttons

---

## Phase 4A: Supabase Setup — COMPLETE ✓

**Database Schema:**
- `users` (id, email, display_name, created_at)
- `groups` (id, name, created_by, created_at)
- `group_members` (id, group_id, user_id, joined_at)
- `expenses` (id, group_id, paid_by_user_id, amount, description, created_at, updated_at)

**Data Fetching:**
- Server components fetch from Supabase (read-only)
- Snake_case DB columns transformed to camelCase types
- `.env.local` configured with Supabase URL and anon key

---

## Phase 4B: Authentication — COMPLETE ✓

**What's Working:**
- Email/password signup and login via `AuthForm` component
- `@supabase/ssr` for cookie-based sessions
- Browser client (`lib/supabase.ts`) and server client (`lib/supabase-server.ts`)
- Middleware redirects: unauthenticated → `/`, authenticated → `/groups`
- Logout button in Nav works
- Database trigger syncs `auth.users` → `public.users` on signup

**Key Files:**
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Browser client factory (for client components) |
| `lib/supabase-server.ts` | Server client with cookies (for server components) |
| `middleware.ts` | Route protection and auth redirects |
| `components/auth/auth-form.tsx` | Login/signup form with mode toggle |

**Latest Commits:**
- `1a0c7e2` - Add Supabase authentication (Phase 4B)
- `648ff04` - Add Supabase integration for data fetching

---

## Phase 4C: Group Membership — COMPLETE ✓

**Goal:** Wire up group membership so users only see groups they belong to.

**Scope (intentionally minimal):**
- No RLS yet
- No permissions/roles logic
- No group creation UI
- No invitations

**Tasks:**
- [x] Filter `/groups` to show only groups where user is a member
- [x] Gate `/groups/[groupId]` — redirect if user is not a member
- [x] Auto-add new users to a default personal new group (or create one on signup)
- [x] Extend signup form to collect displayName
- [x] Pass displayName via auth metadata
- [x] Use displayName when creating default group (e.g., "Alex's Group")

**What was implemented:**
- Database trigger `handle_new_user` updated to create personal group on signup
- Signup form collects displayName (required field)
- `/groups` filters by membership via `group_members` table
- `/groups/[groupId]` verifies membership before loading, redirects if not a member
- Empty state shown when user has no groups

### Implementation Notes

**Current State:**
- `/groups` fetches ALL groups (no user filtering)
- `/groups/[groupId]` fetches group data without checking membership
- Test data has "Household" group with 2 members (You, Casey) — these are old mock users, not real auth users

**Changes Needed:**

1. **`app/groups/page.tsx`** — Filter by membership:
   ```sql
   -- Current: fetches all groups
   -- Change to: fetch groups where user is a member
   SELECT groups.* FROM groups
   INNER JOIN group_members ON groups.id = group_members.group_id
   WHERE group_members.user_id = {auth.user.id}
   ```

2. **`app/groups/[groupId]/page.tsx`** — Verify membership:
   - After fetching group, check if `authUser.id` is in `group_members`
   - If not, redirect to `/groups` (or show error)

3. **Auto-add to default group** — Two options:
   - **Option A:** Modify the `handle_new_user` trigger to also insert into `group_members` for a default group
   - **Option B:** Create a "Personal" group for each new user on signup

  Decision (locked for this phase):
  Create a new personal group for each user on signup (e.g. "Alex’s Group"), and add only that user as a member.
  This avoids fake multi-user state and matches the final data model. Invitations and shared groups will come later.
  
  Casey and other mock users are no longer used from this phase onward.  All membership should be based on real authenticated users only.

  New user's first group / default group should no longer be called "Household", instead ${display_name}'s Group.  For example a user called Alex would see "Alex's Group" when signing up.  

**SQL to auto-add new users to Household group:**
```sql
-- Add to the existing handle_new_user() function:
INSERT INTO group_members (group_id, user_id)
VALUES (
  (SELECT id FROM groups WHERE name = 'Household' LIMIT 1),
  NEW.id
);
```

**Testing:**
1. Create a new account
2. Should be redirected to `/groups`
3. Should see personal group (e.g., "Alex's Group")
4. Click into group → should load split page

---

## Phase 5: Group Creation — COMPLETE ✓

**Goal:** Allow users to create their own groups.

**Tasks:**
- [x] Create group form component
- [x] Insert into `groups` table
- [x] Add creator to `group_members`
- [x] Redirect to new group page

**What was implemented:**
- `GroupCreateForm` component with group name input
- `CreateGroupSection` client wrapper for inline form toggle
- Inserts into `groups` table, then `group_members`
- Redirects to new group page on success

**Key Files:**
| File | Purpose |
|------|---------|
| `components/groups/group-create-form.tsx` | Form for creating groups |
| `components/groups/create-group-section.tsx` | Client wrapper with toggle state |
| `app/groups/page.tsx` | Groups dashboard with create button |

---

## Phase 6: Expense Mutations — COMPLETE ✓

**Goal:** Make Simple Split fully functional by persisting expense add/edit/delete to Supabase.

**Tasks:**
- [x] Create server actions file (`app/actions/expenses.ts`)
- [x] Convert `handleAddExpense` → `createExpense()` server action
- [x] Convert `handleUpdateExpense` → `updateExpense()` server action
- [x] Convert `handleDeleteExpense` → `deleteExpense()` server action
- [x] Add loading/error states
- [x] Icon buttons for edit/delete

**What was implemented:**
- Server actions: `createExpense()`, `updateExpense()`, `deleteExpense()`
- `split-page.tsx` removed local expenses state, now uses `initialExpenses` from server
- Loading states disable buttons during operations
- Error display for failed operations
- `revalidatePath()` + `router.refresh()` for data sync

**Key Files:**
| File | Purpose |
|------|---------|
| `app/actions/expenses.ts` | Server actions for expense CRUD |
| `components/split-page.tsx` | Calls server actions, manages UI state |
| `components/expenses/expense-item.tsx` | Edit/delete icon buttons |

---

## Phase 7: Basic User Settings — COMPLETE ✓

**Goal:** Allow users to update their display name.

**Tasks:**
- [x] Create server action (`app/actions/user.ts`)
- [x] Create settings page (`app/settings/page.tsx`)
- [x] Create settings form (`components/settings/settings-form.tsx`)
- [x] Add settings link to Nav with gear icon

**What was implemented:**
- Server action `updateDisplayName(displayName)` gets user ID from auth session (not client props)
- Settings page at `/settings` with display name form
- Success/error feedback in form
- Nav shows Settings (gear icon) and Log out (exit icon) buttons

**Key Files:**
| File | Purpose |
|------|---------|
| `app/actions/user.ts` | Server action for updating display name |
| `app/settings/page.tsx` | Settings page (server component) |
| `components/settings/settings-form.tsx` | Settings form (client component) |
| `components/nav.tsx` | Navigation with Settings link |

**Important:** Changing display_name does NOT rename existing groups. Group names are independent.

---

## Phase 8: Security (RLS) — COMPLETE ✓

**Goal:** Enforce access rules at the database level using Supabase Row Level Security.

**Tasks:**
- [x] Enable RLS on `users` table
- [x] Enable RLS on `groups` table
- [x] Enable RLS on `group_members` table
- [x] Enable RLS on `expenses` table
- [x] Write policies for each table
- [x] Test with multiple accounts (verify cross-group access blocked)
- [x] Verify existing functionality still works

**What was implemented:**
- Helper function `get_user_group_ids(uid)` with SECURITY DEFINER to avoid circular policy dependencies
- Policies:
  - `users`: SELECT self + users in shared groups, UPDATE self only
  - `groups`: SELECT by membership OR creator, INSERT for authenticated
  - `group_members`: SELECT by membership, INSERT self only
  - `expenses`: full CRUD by group membership (no ownership check)
- Migration files in `supabase/migrations/` (01-07)

**Testing verified:**
- [x] User A cannot see User B's groups
- [x] User A cannot see expenses in groups they don't belong to
- [x] User A can still CRUD expenses in their own groups
- [x] New user signup still works (trigger creates group)
- [x] Group creation works (creator can see group before membership added)

---

## Phase 9A: Email-based Invitations — COMPLETE ✓

**Goal:** Let users invite others to groups by email. Minimal implementation for existing users only.

**Scope:**
- Email-based invitations only (no invite links, no QR codes)
- Invitations can only be accepted by existing users
- If email not found → show "Ask them to sign up first"
- No roles/permissions beyond membership

**What was implemented:**
- Database schema: `group_invitations` table with RLS policies
- Helper functions (SECURITY DEFINER) to bypass RLS for invitation lookups
- Server actions: createInvitation, acceptInvitation, declineInvitation, cancelInvitation
- UI: Invite button on group page, pending invitations on dashboard
- Inviter can cancel pending invitations
- Fixed hydration errors with consistent date formatting

**Testing verified:**
- [x] Run migrations in Supabase (08-11)
- [x] Test invite flow: send invite to existing user email
- [x] Test accept flow: invitee sees invitation on dashboard, can accept
- [x] Test decline flow: invitee can decline
- [x] Test cancel flow: inviter can cancel pending invitation
- [x] Test error cases:
  - [x] Invite non-existent email → shows "Ask them to sign up first"
  - [x] Invite existing member → shows "Already a member"
  - [x] Duplicate pending invite → shows "Invitation already sent"

**Key Files:**
| File | Purpose |
|------|---------|
| `supabase/migrations/08_invitations_table.sql` | Invitations table definition |
| `supabase/migrations/09_invitations_rls.sql` | RLS policies for invitations |
| `supabase/migrations/10_email_exists_function.sql` | Helper to check email exists (bypasses RLS) |
| `supabase/migrations/11_invitation_helpers.sql` | Helper functions for invitation details |
| `types/index.ts` | Invitation type definitions |
| `app/actions/invitations.ts` | Server actions for invite CRUD |
| `app/groups/page.tsx` | Groups dashboard with pending invitations |
| `app/groups/[groupId]/page.tsx` | Group detail fetching invitations |
| `components/split-page.tsx` | Group page with invite button |
| `components/invitations/invite-form.tsx` | Email invite form |
| `components/invitations/pending-invitation-card.tsx` | Accept/Decline card |
| `components/invitations/group-invitations-list.tsx` | Pending invites for group |

---

## Phase 9B: Group Deletion (Minimal) — COMPLETE ✓

**Goal:** Allow group creators to delete their groups.

**Scope (strict):**
- Only the group creator can delete
- Hard delete only (no soft delete)
- Cascade delete is acceptable
- No leave-group functionality
- No ownership transfer
- No undo
- No audit/history
- No UI for non-creators

**What was implemented:**
- Database: RLS DELETE policy (creator-only)
- Server action: `deleteGroup(groupId)` in `app/actions/groups.ts`
- UI: "Danger Zone" section at bottom of group page (only visible to creator)
- Confirmation dialog before deletion
- Error handling and loading states
- Redirects to `/groups` after successful deletion
- Relies on database CASCADE constraints for cleanup

**Testing verified:**
- [x] Group creator sees "Danger Zone" section
- [x] Non-creator does NOT see "Danger Zone"
- [x] Confirmation dialog appears on delete
- [x] Successful deletion redirects to `/groups`
- [x] Deleted group removed from groups list
- [x] RLS blocks non-creator deletion attempts

**Key Files:**
| File | Purpose |
|------|---------|
| `supabase/migrations/12_groups_delete_policy.sql` | RLS DELETE policy for groups |
| `app/actions/groups.ts` | Server action for deleteGroup |
| `app/groups/[groupId]/page.tsx` | Determines isCreator, passes to component |
| `components/split-page.tsx` | Danger Zone UI with delete button |

**Important Notes:**
- The `groups` table already had `created_by` column (from Phase 5)
- Database cascade deletes handle cleanup of:
  - `group_members` (members removed)
  - `expenses` (all expenses deleted)
  - `group_invitations` (pending invites deleted)
- RLS policy: `created_by = auth.uid()` enforces creator-only delete at DB level
- Server action includes defensive creator check before RLS
- UI uses existing `Button` component with `variant="danger"`
- Matches existing confirmation pattern (`window.confirm()`)

**Future Considerations (NOT implemented):**
- Leave group functionality (for non-creators)
- Ownership transfer
- Soft delete / archiving
- Deletion audit log
- Email notifications to members

---

## Phase 10: UX & Polish — COMPLETE ✓

**Goal:** Improve usability, feedback, and mobile experience.

**What was implemented:**
- [x] Compact 2-line expense layout on mobile (vs 4-5 lines previously)
- [x] Accept/Decline invitation buttons show loading text
- [x] Cancel invitation requires confirmation dialog
- [x] Mobile hamburger menu in nav (dropdown for Settings/Logout/Back to Groups)
- [x] Hide "Settle" text on mobile (logo icon only)
- [x] Updated README.md with app description, features, tech stack

**Key Files:**
| File | Purpose |
|------|---------|
| `components/expenses/expense-item.tsx` | Compact mobile expense layout |
| `components/invitations/pending-invitation-card.tsx` | Loading text on Accept/Decline |
| `components/invitations/group-invitations-list.tsx` | Confirm dialog for cancel |
| `components/nav.tsx` | Mobile hamburger menu |
| `README.md` | App description, features, tech stack |

---

## Phase 11: Deployment — COMPLETE ✓

**Goal:** Ship it to production.

**What was implemented:**
- [x] Pre-deployment audit (auth, RLS, env vars, middleware)
- [x] Added `/settings` to middleware route protection
- [x] Deployed to Vercel at https://settleit.xyz (also: https://simple-split-seven.vercel.app/)
- [x] Configured environment variables on Vercel
- [x] Added production URL to Supabase Auth redirect URLs
- [x] Production testing passed (auth flow, route protection, expense CRUD)

**Production Setup:**
| Service | Configuration |
|---------|---------------|
| Vercel | Auto-deploys on push to `main` |
| Supabase | Auth redirects configured for production URL |
| Middleware | Protects `/groups/*` and `/settings` routes |

**Environment Variables (Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Phase 12A: Group Renaming (Minimal) — COMPLETE ✓

Goal: Allow the group creator to rename a group.

Scope:
	•	Creator-only (use created_by)
	•	Simple UI (inline edit or small form)
	•	Server action to update groups.name
	•	RLS enforcement (UPDATE policy)
	•	No notifications
	•	No rename history

Constraints:
	•	Do not touch group membership
	•	Do not cascade changes
	•	No new tables

**What was implemented:**
	•	RLS UPDATE policy: `/supabase/migrations/14_groups_update_policy.sql`
		- Creator-only access using `created_by = auth.uid()`
	•	Server action: `updateGroupName()` in `/app/actions/groups.ts`
		- Validates input (empty, max 100 chars)
		- Verifies creator status
		- Updates group name with revalidation
	•	UI: Inline edit form in `/components/split-page.tsx`
		- Pencil icon next to group name (creator-only)
		- Click to edit → inline form appears
		- Save/Cancel buttons with loading states
		- Keyboard shortcuts (Enter/Escape)
		- Mobile responsive
		- Client + server validation
		- Error handling


## Phase 12B: Show Group Creator on Groups Page — COMPLETE ✓

**Goal:** Show "Created by {creatorName}" under group names on the /groups page, but only for groups created by other users.

**What was implemented:**
- Updated groups query to join `users` table via `created_by` foreign key
- Added creator's display name (with fallback to email or "Unknown")
- Conditional display: only shows "Created by X" when group was not created by current user
- Format: "Created by Alex · 2 members"

**Key Files:**
| File | Purpose |
|------|---------|
| `app/groups/page.tsx` | Updated query and UI rendering |

---

## Phase 12C: Sort Groups by Recent Activity — COMPLETE ✓

**Goal:** Display groups sorted by most recent expense activity, not creation date.

**What was implemented:**
- Created Postgres function `get_user_groups_with_activity()` (SECURITY INVOKER)
- Computes `last_activity` from MAX of expense timestamps per group
- Falls back to group `created_at` if no expenses exist
- Groups list automatically sorted by most recently active first

**Key Files:**
| File | Purpose |
|------|---------|
| `supabase/migrations/15_groups_activity_sort.sql` | Postgres function for activity-based sorting |
| `app/groups/page.tsx` | Uses `.rpc()` call instead of direct query |

---

## Phase 12D: Unread Activity Indicator — COMPLETE ✓

**Goal:** Show red dot next to groups with unseen expense activity.

**What was implemented:**
- Added `last_seen_at` column to `group_members` table
- Added RLS UPDATE policy for users to update their own `last_seen_at`
- Created `updateLastSeen()` server action
- Group detail page calls `updateLastSeen()` on load (fire-and-forget)
- Groups list compares `last_activity > last_seen_at` to show red dot
- Red dot disappears after visiting the group

**Key Files:**
| File | Purpose |
|------|---------|
| `supabase/migrations/16_group_members_last_seen.sql` | Schema + RLS for last_seen_at |
| `supabase/migrations/17_update_groups_activity_function.sql` | Updated function with last_seen_at |
| `app/actions/groups.ts` | `updateLastSeen()` server action |
| `app/groups/[groupId]/page.tsx` | Calls updateLastSeen on load |
| `app/groups/page.tsx` | Red dot indicator UI |

---

## Phase 13A: Upgrade Invite System - COMPLETE

We want to upgrade Settle’s group invitation system to support link-based invites alongside email invites.

Current state:
- group_invitations table exists
- Email-based invites require accepting a pending invite
- group_members insertion is protected by RLS (user_id = auth.uid())

Target behavior:
1. Inviting a user generates a single invite URL with a secure token
2. The invite modal shows:
   - Option A: enter email (optional)
   - Option B: copy invite link
3. Both options generate the same invite URL
4. If email is provided:
   - Create a pending invitation (current behavior)
   - Also generate the invite URL
   - Use a mailto: link (not transactional email)
5. Visiting the invite URL:
   - If logged in → user is added to the group immediately
   - If not logged in → redirect to signup, then add them after signup
   - Email used to sign up does NOT matter
6. Existing users who follow the link bypass pending invites and are added directly

Constraints:
- Minimal schema changes
- Reuse group_invitations if possible
- No push notifications
- No email service (mailto only)
- Keep RLS simple and intact

Please:
- Propose schema changes
- Define RLS implications
- Design server actions
- Define the /invite/[token] route behavior
- Suggest UI changes
- Provide an incremental implementation plan

## Phase 13B: iOS Invites - COMPLETE

Enhance the existing invite link UI to support native sharing on mobile using the Web Share API.

Requirements:
- Use navigator.share() when available to open the native share sheet (iOS/Android)
- Fallback to copy-to-clipboard when Web Share is not supported
- No backend changes
- No schema or RLS changes
- Reuse the existing generated invite URL
Apply this only to the invite UI.

## Phase 13C - Group currency symbols - COMPLETE

- Add ability to choose currency of new group upon creation.
- Just simply changes currency symbol at the moment, no conversion yet.


## Phase 14A: Settle Up (Core) - COMPLETE

Goal:
Allow users to settle balances within a group without deleting expense history.

Rules:
- Never delete or modify past expenses
- Settlement should bring balances back to zero
- Settlement should be represented as a new expense

Scope:
- Add "Settle Up" button on group page
- Modal shows "Pay {user} ${amount}"
- "Mark as settled" creates settlement expense(s)
- Reuse existing balance calculation logic

Constraints:
- No external payments
- No Venmo / PayPal yet
- No partial settlements
- Keep schema changes minimal

Please propose:
- Data model (prefer reusing expenses)
- Server actions
- UI flow
- Edge cases
- Implementation order

## Phase 14B: Settlements

Design how settlement expenses should be stored and displayed.

Requirements:
- Settlement expenses must not affect historical visibility
- They must reset balances cleanly
- They should be clearly identifiable in the UI

Questions to answer:
- Should settlement be one expense per pair or a single group expense?
- How should paid_by and splits be set?
- How should they be labeled and styled?

## Phase 14C: External Payment Links (No Payment Processing)

Goal:
Allow users to launch Venmo, or PayPal with prefilled payment details, from the settle up screen.

Constraints:
- No API keys
- No webhooks
- No backend payment processing
- Fallback to "Mark as settled" always available

Please propose:
- Deep link formats for Venmo and PayPal
- How to detect mobile vs desktop
- UI placement and copy
- Failure handling

For this phase:
- Do NOT store Venmo or PayPal usernames
- Generate payment links with amount only
- User selects recipient inside the payment app
- Always provide a "Mark as settled" fallback
- No schema changes required

## Phase 15 - Customize Expense / Uneven Splits

Phase 15: Advanced Expense Splitting (Power User Feature)

Goal:
Add optional advanced expense splitting while keeping the default “quick add” flow unchanged.

Principles:
- Default expense creation must remain fast and simple
- Advanced splitting is opt-in via a “Customize split” button
- No breaking changes to existing expenses
- Balance logic must remain correct and extensible

Functional Requirements:

1. Default Behavior (unchanged)
- Expense amount + optional description
- Split equally among all group members

2. Customize Split (Step 1)
- Add a “Customize split” button to the Add Expense form
- When enabled:
  - Show list of group members with checkboxes
  - Checked members are included in the split
  - Unchecked members are excluded
- If no advanced amounts are provided, split equally among selected members

3. Advanced Split (Step 2)
- Inside Customize Split, add an “Advanced” toggle
- For each selected member:
  - Show an amount input (optional)
- User may enter exact amounts for some members
- Remaining amount is auto-distributed evenly among others
- Total of all splits must equal expense amount
- Validate and block submission if totals don’t match

Data Model:
- Introduce a new expense_splits table:
  - expense_id
  - user_id
  - amount
- If an expense has splits, use them
- If not, fall back to equal split logic

Implementation Scope:
- Schema migration for expense_splits
- RLS policies consistent with existing group access rules
- Update balance calculation to support optional splits
- Update Add Expense UI with progressive disclosure
- No UI changes to expense list display (for now)

Constraints:
- No refactor of existing expense schema beyond what’s necessary
- No performance regressions
- No new dependencies
- Keep logic readable and incremental

Please propose:
- Migration SQL
- RLS impact
- Balance calculation changes
- UI component changes
- Incremental implementation order

## Architecture

### Current Data Flow
```
Middleware (middleware.ts)
  ↓ checks auth session
  ↓ redirects if needed
Server Component (page.tsx)
  ↓ creates server Supabase client
  ↓ fetches authenticated user
  ↓ fetches data from Supabase
Client Component (split-page.tsx)
  ↓ receives data as props (initialExpenses, users, group)
  ↓ manages UI state only (editingExpense, loading, error)
  ↓ calls server actions for mutations
Server Actions (app/actions/*.ts)
  ↓ validates input
  ↓ performs Supabase mutation
  ↓ calls revalidatePath()
  ↓ returns success/error
```

### Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with AuthForm |
| `app/groups/page.tsx` | Groups dashboard |
| `app/groups/[groupId]/page.tsx` | Split page wrapper |
| `app/settings/page.tsx` | User settings page |
| `app/actions/expenses.ts` | Expense CRUD server actions |
| `app/actions/user.ts` | User profile server actions |
| `app/actions/invitations.ts` | Invitation server actions |
| `components/split-page.tsx` | Main split page UI + logic (client) |
| `components/settings/settings-form.tsx` | Settings form (client) |
| `components/auth/auth-form.tsx` | Login/signup form |
| `components/nav.tsx` | Navigation with settings/logout |
| `components/invitations/*` | Invitation UI components |
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client |
| `middleware.ts` | Auth route protection |

---

## Commands

```bash
npm run dev      # localhost:3000 (or 3001)
npm run build    # Production build
npx tsc --noEmit # Type check
```

---

## Notes

- Supabase project: `ezlfsvbjkgxgrbcrsqlp.supabase.co`
- Email confirmation is disabled for development
- Database trigger `handle_new_user` syncs auth.users → public.users
- Next.js 16 shows deprecation warning for middleware (still works)


## NON-CLAUDE BRAINSTORMING SECTION START

*DO NOT DELETE WHEN UPDATING TODO.md - CLAUDE CAN RESPOND TO IDEAS IN THIS SECTION DURING PLAN MODE AND DISCUSS ITEMS WITH ME, BUT DO NOT EDIT OR DELETE*

Today's tasks:

TODO:

- Light grey button hover

Custom splitting

- Step 1: Customize split - Choose which group members this expense applies to.
- Step 2: 'Advanced' button or similar, within customize split section, dial in exact amounts each person owes for this expense. 

  Example for step 1: 4 housemates have a group.  One stays home, the other 3 get a taxi together.  The person who paid for the taxi can select 'customize split' button - to the bottom right of the add expense box.  This then gives them a list of everyone's display names that are in the group with check boxes, and they can select who should be included in this split. 

  Example for step 2: 4 housemates have a group and go out to dinner.  One did not get food at dinner, only $15 of drinks (we'll call them Martin).  The person paying the $250 bill adds $250 (can be done both on the main 'add expense' box before clicking customize -> advanced settings, or after clicking customize and advanced.).  The user paying then has every group members name with a box for amount under.  They input '$15' under Martin's name.  Settle then works out what the split would be for the rest of the group.  So 250 total, 15 for Martin, other three take the remaining $235 divided by 3.  


  - Check total reset after any settlement is made, does this work?
