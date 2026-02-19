# Markd — Smart Bookmark App

A full-stack bookmark manager with Google OAuth, real-time sync, and a clean light-mode UI.

**Live Demo:** _Add your Vercel URL here after deployment_

---

## Features

- **Google OAuth** — one-click sign-in, no passwords
- **Private bookmarks** — each user only sees their own (Row-Level Security via Supabase)
- **Real-time updates** — bookmarks appear/disappear instantly across all open tabs and devices
- **Favicon display** — automatically fetches site icons for every saved bookmark
- **Responsive UI** — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + Inter font |
| Auth | Supabase Auth (Google OAuth 2.0) |
| Database | Supabase (PostgreSQL + RLS) |
| Realtime | Supabase Realtime (postgres_changes) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Enable Google OAuth in **Authentication  Providers  Google**

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)  APIs & Services  Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `https://<your-supabase-project>.supabase.co/auth/v1/callback` as an Authorized redirect URI
4. Copy the Client ID and Secret into Supabase's Google provider settings

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

```sql
create table public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  url        text not null,
  created_at timestamptz default now()
);
```

Row-Level Security ensures users can only read/write their own bookmarks.

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the two environment variables in Vercel's dashboard
4. Deploy
5. Add your Vercel URL to allowed redirect URIs in both Google Cloud Console and Supabase

---

## Project Structure

```
 app/
    auth/callback/       # OAuth code exchange route
    bookmarks/           # Main bookmarks page (Server Component)
    login/               # Login page
    globals.css
 components/
    BookmarksClient.tsx  # All bookmark state + realtime subscription
    SignOutButton.tsx
 lib/
    supabase/
       client.ts        # Browser Supabase client
       server.ts        # Server Supabase client
    types.ts
 supabase/
    schema.sql           # DB schema, RLS policies, Realtime setup
 proxy.ts                 # Auth guard (Next.js 16 middleware)
```
