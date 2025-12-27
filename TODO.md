# Simple Split - Progress & Plan

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

## Phase 9A: Email-based Invitations — IN PROGRESS

**Goal:** Let users invite others to groups by email. Minimal implementation for existing users only.

**Scope:**
- Email-based invitations only (no invite links, no QR codes)
- Invitations can only be accepted by existing users
- If email not found → show "Ask them to sign up first"
- No roles/permissions beyond membership

**Database:**
- [x] Create `group_invitations` table (`supabase/migrations/08_invitations_table.sql`)
- [x] Add RLS policies for invitations (`supabase/migrations/09_invitations_rls.sql`)
- [ ] Run migrations in Supabase dashboard

**Types:**
- [x] Add `Invitation` and `InvitationWithDetails` types to `types/index.ts`

**Server Actions** (`app/actions/invitations.ts`):
- [x] `createInvitation(groupId, email)` - create pending invitation
- [x] `acceptInvitation(invitationId)` - accept and join group
- [x] `declineInvitation(invitationId)` - decline invitation
- [x] `cancelInvitation(invitationId, groupId)` - cancel pending invitation (inviter only)

**UI - Groups Dashboard** (`app/groups/page.tsx`):
- [x] Fetch pending invitations for current user
- [x] Display "Pending Invitations" section with Accept/Decline buttons
- [x] Create `components/invitations/pending-invitation-card.tsx`

**UI - Group Detail Page**:
- [x] Add "Invite" button to header (`components/split-page.tsx`)
- [x] Create invite form component (`components/invitations/invite-form.tsx`)
- [x] Display pending invitations for the group (`components/invitations/group-invitations-list.tsx`)
- [x] Allow inviter to cancel their pending invitations

**Testing:**
- [ ] Run migrations in Supabase
- [ ] Test invite flow: send invite to existing user email
- [ ] Test accept flow: invitee sees invitation on dashboard, can accept
- [ ] Test decline flow: invitee can decline
- [ ] Test cancel flow: inviter can cancel pending invitation
- [ ] Test error cases:
  - [ ] Invite non-existent email → shows "Ask them to sign up first"
  - [ ] Invite existing member → shows "Already a member"
  - [ ] Duplicate pending invite → shows "Invitation already sent"
- [ ] Verify RLS: users can only see/modify their own invitations

**Key Files:**
| File | Purpose |
|------|---------|
| `supabase/migrations/08_invitations_table.sql` | Invitations table definition |
| `supabase/migrations/09_invitations_rls.sql` | RLS policies for invitations |
| `types/index.ts` | Invitation type definitions |
| `app/actions/invitations.ts` | Server actions for invite CRUD |
| `app/groups/page.tsx` | Groups dashboard with pending invitations |
| `app/groups/[groupId]/page.tsx` | Group detail fetching invitations |
| `components/split-page.tsx` | Group page with invite button |
| `components/invitations/invite-form.tsx` | Email invite form |
| `components/invitations/pending-invitation-card.tsx` | Accept/Decline card |
| `components/invitations/group-invitations-list.tsx` | Pending invites for group |

---

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

- I see the app as being three pages

    1. Landing page - login / create account component and large Simple Split title.

    2. Dashboard / groups page - A simple table of groups available to user if any, with a button to create a 'new group'.

    3. The main Simple Split page that has been worked on already, showing the working Simple Split app, balance card with summary, expense form below, and expense list below that.

- Users create an account or log in, taken to a page with no groups, option to either create a split group or join a group.  If they select join they put in the email address or username of the person whos group they are trying to join.  Once a group is created, there is an option to add to group, and use either another user's username or their email address.  Invited users can join the group and will remain in the group.  They have the option to leave groups.  The creator has the option to remove users from groups.

(Big question is how do we implement this?  Is this all dooable on Supabase?  When is the best time to create the UI for the landing / log-in page and groups page, following the main app's design?)




*NON-CLAUDE BRAINSTORMING SECTION ENDS*
