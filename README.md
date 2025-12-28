# Settle

A simple expense-splitting app for groups. Track shared costs, see who owes what, and keep things fair.

## Features

- Create and manage expense groups
- Add, edit, and delete expenses
- Real-time balance calculations per member
- Invite others by email
- Accept or decline group invitations
- Delete groups (creator only)

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

**Version:** 1.0 (Phase 10 - UX Polish)

All core functionality is complete. Currently in polish phase for improved usability and mobile experience.
