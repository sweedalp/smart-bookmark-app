# Markd — Smart Bookmark App

A full-stack bookmark manager with Google OAuth, real-time sync, and a clean light-mode UI.

**Live Demo:** https://smart-bookmark-8odciptgm-sweedals-projects.vercel.app
**GitHub:** https://github.com/sweedalp/smart-bookmark-app

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

---

## Problems Faced & How I Solved Them

### 1. `create-next-app` failed — folder name had capital letters
**Problem:** Running `npx create-next-app` inside `Smart_Bookmark_App` threw an error because npm package names cannot have uppercase letters.
**Solution:** Manually scaffolded the entire project — created `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, and all app files by hand.

---

### 2. `middleware.ts` not working in Next.js 16
**Problem:** Next.js 16 renamed the middleware export convention. The standard `middleware.ts` with `export function middleware()` was silently ignored, so auth protection wasn't working.
**Solution:** Renamed the file to `proxy.ts` and exported a `proxy()` function — the new convention for Next.js 16.

---

### 3. Real-time inserts/deletes only appeared after a page refresh
**Problem:** Adding or deleting a bookmark didn't update the UI instantly — it only showed after a manual refresh. The Supabase Realtime subscription was firing but state wasn't updating correctly.
**Solution:** The root cause was two separate components (`AddBookmarkForm` and `BookmarkList`) each managing their own state. Merged them into a single `BookmarksClient` component that owns all state. Also used `.select().single()` after `.insert()` so the newly created row is returned immediately and added to state — preventing a race condition between the optimistic update and the realtime event.

---

### 4. Realtime subscription not firing at all
**Problem:** Even after the merge fix, realtime DELETE events weren't coming through consistently.
**Solution:** Supabase Realtime requires `REPLICA IDENTITY FULL` on the table to send the old row data on DELETE. Ran `ALTER TABLE public.bookmarks REPLICA IDENTITY FULL` in the Supabase SQL Editor, and also confirmed the table was added to the `supabase_realtime` publication.

---

### 5. CSS parse error — `@import` after `@tailwind`
**Problem:** Browser showed "Parsing CSS source code failed" — `@import` rules must come before all other rules in CSS.
**Solution:** Moved the Google Fonts `@import` to the very top of `globals.css`, before the `@tailwind` directives.

---

### 6. TypeScript error on cookie options
**Problem:** `cookiesToSet` parameter in `server.ts` and `proxy.ts` was implicitly typed as `any`, causing a TypeScript strict mode error.
**Solution:** Explicitly typed it as `{ name: string; value: string; options?: CookieOptions }[]` using the `CookieOptions` type imported from `@supabase/ssr`.
