Current Phase: Phase 9 – Invitations & Collaboration
Last Updated: 2025-12-25


######################################################


Simple Split – Project Roadmap

This document provides a high-level, end-to-end view of the Simple Split project. It is intended as a reference, not a task-by-task TODO. Use it to understand scope, sequencing, and what remains to be built.

⸻

✅ Completed Foundations (Phase 1 to 4B)

UI & Routing
	•	Landing page (login / signup)
	•	Groups dashboard
	•	Group detail page (Simple Split UI)
	•	Clean App Router structure

Data & Architecture
	•	Supabase project created
	•	Core schema implemented:
	•	users
	•	groups
	•	group_members
	•	expenses
	•	Server vs Client component separation
	•	Mock data fully replaced by Supabase (read-only)

Authentication
	•	Email/password auth
	•	Login / signup / logout
	•	Middleware route protection
	•	Auth → public.users sync trigger
	•	Real currentUser from session

⸻

✅ Phase 4C: Group Membership (COMPLETE)

Goal: Connect authenticated users to the groups they belong to.
	•	Ensure logged-in users only see groups they are members of
	•	Auto-add new users to a default group or create a group on signup
	•	Prevent access to /groups/[groupId] if user is not a member
	•	Friendly empty state if user has no groups

What was implemented:
	•	Database trigger creates personal group on signup (e.g., "Alex's Group")
	•	Signup form collects displayName (required)
	•	/groups filters by membership
	•	/groups/[groupId] verifies membership, redirects if not a member

⸻

✅ Phase 5: Group Creation (COMPLETE)

Goal: Allow users to create their own groups.
	•	Create group form
	•	Insert into groups
	•	Add creator to group_members
	•	Redirect to new group page

What was implemented:
	•	GroupCreateForm component with inline toggle
	•	Inserts into groups table, then group_members
	•	Redirects to new group page on success

Note: Group deletion intentionally deferred until roles, invitations, and RLS are in place

⸻

✅ Phase 6: Expense Mutations (COMPLETE)

Goal: Make Simple Split fully functional.
	•	Add expense (insert)
	•	Edit expense (update)
	•	Delete expense (delete)
	•	Convert client handlers → server actions

What was implemented:
	•	Server actions in `app/actions/expenses.ts`
	•	`split-page.tsx` calls server actions with loading/error states
	•	Expenses persist to Supabase and survive page refresh
	•	Icon buttons for edit (pencil) and delete (trash)

⸻

✅ Phase 7: Basic User Settings (COMPLETE)

Goal: Allow users to update their profile.
	•	Change display name
	•	Settings page at `/settings`

What was implemented:
	•	Settings page with display name form
	•	Server action `updateDisplayName()` gets user from auth session
	•	Nav includes Settings link with gear icon
	•	Display name changes do NOT affect group names

⸻

✅ Phase 8: Security (RLS) (COMPLETE)

Goal: Enforce access rules at the database level.

What was implemented:
	•	RLS enabled on all tables (users, groups, group_members, expenses)
	•	Helper function `get_user_group_ids()` to avoid circular policy dependencies
	•	Policies:
	•	users: SELECT self + group members, UPDATE self only
	•	groups: SELECT by membership or creator, INSERT for authenticated
	•	group_members: SELECT by membership, INSERT self only
	•	expenses: full CRUD by group membership (no ownership check)
	•	Cross-group access blocked and verified with multiple accounts
	•	Migration files in `supabase/migrations/`

⸻

🤝 Phase 9: Invitations & Collaboration

Goal: Let users share groups.

### Phase 9A: Email-based Invitations (IN PROGRESS)

**What's being implemented:**
- Invite users by email
- Accept/decline invitations
- Cancel pending invitations (inviter only)
- Existing users only: if email not found → "Ask them to sign up first"
- No notifications/emails — invitations appear on /groups dashboard

**Code complete, pending database migration:**
- `group_invitations` table with RLS policies (migrations 08, 09)
- Server actions: createInvitation, acceptInvitation, declineInvitation, cancelInvitation
- UI: Invite button on group page, pending invitations on dashboard

### Phase 9B: Invite Links & QR Codes (FUTURE)
- Invite link generation
- QR code support

⸻

✨ Phase 10: UX & Polish

Goal: Improve usability and feel.
	•	Loading states
	•	Error handling
	•	Empty states
	•	Confirm dialogs
	•	Mobile polish (e.g. Expenses Table items become large and multiple lines when in smaller screen size, needs to look cleaner and smaller.)
	•	Update README.md with a concise and appealing description of the simple cost splitting app, tech stack, version and what's included.

⸻

🚀 Phase 11: Deployment

Goal: Ship it.
	•	Deploy to Vercel
	•	Configure environment variables
	•	Test auth & redirects in production
	•	Share with real users

⸻

🧠 How to Use This Roadmap
	•	This is not a checklist
	•	Detailed, actionable steps live in TODO.md
	•	This roadmap answers:
	•	What exists
	•	What comes next
	•	What can safely be ignored for now

⸻

🎯 Suggested v1 Cutoff

A solid v1 could stop after:
	•	Group creation
	•	Expense CRUD
	•	Basic RLS

Everything beyond that is enhancement, not requirement.


Future Ideas
	•	User default currency change in settings
	•	Currency choice on 'create new group', defaults to user's chosen prefrence currency
	•	Option to choose currency per expense (with a warning that conversion from expense currency to group's currency is the conversion rate as of the time expense listed, and may not accuratly represent the amount spent at the time.)