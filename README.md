# 📌 Smart Bookmark App

A real-time bookmark manager built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

**Live URL:** _Add your Vercel URL here after deployment_

---

## Features

| Feature | How it works |
|---|---|
| Google OAuth login | Supabase Auth with the Google provider — no email/password |
| Add bookmarks | Insert a title + URL into the `bookmarks` table |
| Private bookmarks | Row Level Security (RLS) ensures users only see their own rows |
| Real-time updates | Supabase Realtime pushes INSERT/DELETE events to all open tabs |
| Delete bookmarks | Soft DELETE via Supabase client, reflected instantly via realtime |
| Deployed on Vercel | CI/CD via GitHub integration |

---

## Tech Stack

- **Next.js 15** — App Router, Server Components, Route Handlers
- **Supabase** — Auth (Google OAuth), PostgreSQL database, Realtime
- **@supabase/ssr** — Cookie-based session management for SSR
- **Tailwind CSS** — Utility-first styling

---

## Project Structure

```
app/
  layout.tsx              # Root layout with Tailwind + metadata
  page.tsx                # Redirects / → /bookmarks
  login/
    page.tsx              # Google sign-in button (Client Component)
  bookmarks/
    page.tsx              # Main page (Server Component — fetches initial data)
  auth/
    callback/
      route.ts            # OAuth code exchange → session cookie
components/
  AddBookmarkForm.tsx     # Form to add a bookmark (Client Component)
  BookmarkList.tsx        # List + delete + realtime subscription (Client Component)
  SignOutButton.tsx       # Sign out (Client Component)
lib/
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client (reads cookies)
  types.ts                # TypeScript interfaces
middleware.ts             # Auth guard + session refresh on every request
supabase/
  schema.sql              # Database schema + RLS policies
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. In **SQL Editor**, paste and run the contents of `supabase/schema.sql`
3. In **Authentication → Providers**, enable **Google** and add your OAuth credentials

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret** into Supabase → Auth → Google provider

### 4. Set environment variables

Copy `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are in Supabase → Settings → API.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push the repo to GitHub (make it **public**)
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — Vercel auto-builds on every push to `main`
5. Add your Vercel domain to Supabase → Auth → URL Configuration → **Site URL** and **Redirect URLs**

---

## Problems I Ran Into & How I Solved Them

### 1. `create-next-app` rejected the folder name
**Problem:** The folder `Smart_Bookmark_App` contains capital letters, which violates npm package naming rules, so `create-next-app` refused to scaffold.  
**Solution:** Created all project files manually, giving full control over the structure from the start.

### 2. Session not persisting on page reload (SSR desync)
**Problem:** Using the standard `createClient()` from `@supabase/supabase-js` directly in server components caused the session to appear `null` on reload because the server couldn't read the browser cookie.  
**Solution:** Switched to `@supabase/ssr` which provides `createServerClient()` and `createBrowserClient()`. The server client reads/writes cookies via Next.js `cookies()`, keeping client and server in sync.

### 3. Realtime not firing for DELETE events
**Problem:** Realtime DELETE events didn't include `payload.new` (the row is gone), so the `id` wasn't available to remove the bookmark from local state.  
**Solution:** Used `payload.old.id` instead — Supabase includes the old row data for DELETE events.

### 4. Duplicate bookmark appearing on insert
**Problem:** When the current tab inserted a bookmark, both the optimistic UI update AND the realtime INSERT event fired, causing a duplicate entry.  
**Solution:** Removed the optimistic update entirely and let the realtime subscription be the single source of truth. Added a deduplication guard (`prev.find(b => b.id === newBookmark.id)`) as a safety net.

### 5. Middleware blocking the auth callback route
**Problem:** The middleware redirected unauthenticated users hitting `/auth/callback` to `/login`, breaking the OAuth flow.  
**Solution:** The middleware `matcher` config already excludes `_next/*` but `/auth/callback` is a plain route. The fix was to check the path: only protect `/bookmarks/*`, not `/auth/*`.
