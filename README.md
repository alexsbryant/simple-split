# Settle

A simple expense-splitting app for groups. Track shared costs, see who owes what, and keep things fair.

Designed for trips, shared households, and small groups who want to split costs without unnecessary complexity.

**Live at:** [https://settleit.xyz](https://settleit.xyz)

## Features

- Create and manage expense groups
- Add, edit, and delete expenses
- Settle up all debts owed
- Real-time balance calculations per member
- Invite others by email, link or QR code
- Accept or decline group invitations
- Rename groups (creator only)
- Delete groups (creator only)
- Groups sorted by recent activity
- Unread activity indicator (red dot for new expenses)
- Light and dark mode (defaults to system)
- Reactions and comments on expenses
- Settings in-line in drop down menu
- Customizable splitting (choose who in the group expense relates to / how much each person gets charged)
- Notifications as a drop down, on click takes user to appropriate update
- Real-time notification updates, red dot appears without refresh or page change

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)
- **Security:** Row Level Security (RLS) on all tables

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Status

**Version:** 1.6

Settle is feature-complete and stable. Future work may include more advanced currency selection, scheduling expenses, and mobile-native builds.
