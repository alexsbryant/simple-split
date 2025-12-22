Current Phase: Phase 1 – Group Membership
Last Updated: 2025-12-22


######################################################


Simple Split – Project Roadmap

This document provides a high-level, end-to-end view of the Simple Split project. It is intended as a reference, not a task-by-task TODO. Use it to understand scope, sequencing, and what remains to be built.

⸻

✅ Completed Foundations

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

🔜 Phase 1: Group Membership (CURRENT)

Goal: Connect authenticated users to the groups they belong to.
	•	Ensure logged-in users only see groups they are members of
	•	Auto-add new users to a default group or create a group on signup
	•	Prevent access to /groups/[groupId] if user is not a member
	•	Friendly empty state if user has no groups

Constraints:
	•	No RLS yet
	•	No permissions / roles
	•	No complex logic

⸻

🧩 Phase 2: Group Creation

Goal: Allow users to create their own groups.
	•	Create group form
	•	Insert into groups
	•	Add creator to group_members
	•	Redirect to new group page

⸻

💸 Phase 3: Expense Mutations

Goal: Make Simple Split fully functional.
	•	Add expense (insert)
	•	Edit expense (update)
	•	Delete expense (delete)
	•	Convert client handlers → server actions
	•	Optional optimistic UI updates

⸻

🔐 Phase 4: Security (RLS)

Goal: Enforce access rules at the database level.
	•	Enable RLS on all tables
	•	Users can only:
	•	Read groups they belong to
	•	Read/write expenses in those groups
	•	Block cross-group access
	•	Test with multiple accounts

⸻

🤝 Phase 5: Invitations & Collaboration

Goal: Let users share groups.
	•	Invite users to groups via:
	•	Email
	•	Invite link
	•	QR code (future-friendly)
	•	Accept invite → add to group_members
	•	Handle existing vs new users

⸻

✨ Phase 6: UX & Polish

Goal: Improve usability and feel.
	•	Loading states
	•	Error handling
	•	Empty states
	•	Confirm dialogs
	•	Mobile polish

⸻

🚀 Phase 7: Deployment

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