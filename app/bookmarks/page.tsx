/**
 * /bookmarks — main page (Server Component)
 *
 * Why Server Component?
 * - We can securely fetch the user's bookmarks on the server using the
 *   session cookie.  The data is ready before the browser receives HTML,
 *   giving a fast initial render with no loading flicker.
 * - Child Client Components (BookmarkList, AddBookmarkForm) hydrate on
 *   top and take over interactivity (realtime, delete, add).
 *
 * Data flow:
 * 1. createClient() (server) reads the auth cookie → knows who is logged in.
 * 2. We SELECT bookmarks WHERE user_id = <current user>.
 *    Row-Level Security (RLS) on Supabase enforces this server-side too.
 * 3. `initialBookmarks` is passed to BookmarkList as a prop.
 *    BookmarkList then keeps that list live via a realtime subscription.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookmarksClient from "@/components/BookmarksClient";
import SignOutButton from "@/components/SignOutButton";
import type { Bookmark } from "@/lib/types";

export default async function BookmarksPage() {
  const supabase = await createClient();

  // Get the authenticated user (verifies the JWT server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Should never reach here thanks to middleware, but guard anyway
  if (!user) redirect("/login");

  // Fetch this user's bookmarks, newest first
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main
      className="min-h-screen px-4 pb-16 pt-8"
      style={{ background: '#f5f3ef' }}
    >
      <div className="mx-auto max-w-2xl">
        {/* ── Header ── */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d52 100%)',
                boxShadow: '0 3px 10px rgba(26,26,46,0.22)',
              }}
            >
              🔖
            </div>
            <div>
              <h1
                className="text-[17px] font-bold leading-tight"
                style={{ color: '#111827', letterSpacing: '-0.025em' }}
              >
                Markd
              </h1>
              <p className="text-[11px] font-medium" style={{ color: '#b5b0a8' }}>
                {user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </header>

        {/* ── Bookmark Form + List (shared state) ── */}
        <BookmarksClient
          initialBookmarks={(bookmarks as Bookmark[]) ?? []}
          userId={user.id}
        />
      </div>
    </main>
  );
}
