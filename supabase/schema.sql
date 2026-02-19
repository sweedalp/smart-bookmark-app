-- ================================================================
-- Smart Bookmark App — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. Create the bookmarks table
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  url        text not null,
  created_at timestamptz not null default now()
);

-- 2. Index for fast per-user queries
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

-- ================================================================
-- Row Level Security (RLS)
-- Ensures User A can NEVER read or modify User B's bookmarks,
-- even if they call the API directly with their own JWT.
-- ================================================================

-- Enable RLS on the table
alter table public.bookmarks enable row level security;

-- Policy: users can only SELECT their own rows
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using ( auth.uid() = user_id );

-- Policy: users can only INSERT rows where user_id = themselves
create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check ( auth.uid() = user_id );

-- Policy: users can only DELETE their own rows
create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using ( auth.uid() = user_id );

-- ================================================================
-- Realtime
-- Enable Supabase Realtime for the bookmarks table so changes
-- are pushed to subscribed clients instantly.
-- ================================================================
alter publication supabase_realtime add table public.bookmarks;
