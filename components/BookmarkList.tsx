/**
 * BookmarkList — Client Component
 *
 * Displays the user's bookmarks and handles DELETE.
 * Subscribes to Supabase Realtime so new bookmarks inserted in another
 * tab (or by another session) appear instantly without page refresh.
 *
 * Realtime flow:
 * 1. We subscribe to postgres_changes on the `bookmarks` table
 *    filtered to `user_id=eq.<userId>`.
 * 2. On INSERT  → prepend the new bookmark to local state.
 * 3. On DELETE  → remove the bookmark from local state.
 *
 * Why Client Component?
 * useEffect is needed for the realtime subscription lifecycle.
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";

export default function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    /**
     * Subscribe to realtime changes on the bookmarks table.
     * `filter` ensures we only receive events for THIS user's rows
     * (though RLS already enforces privacy server-side).
     */
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          // Only show bookmarks belonging to this user
          if (newBookmark.user_id !== userId) return;
          // Avoid duplicates if the insert came from this same tab
          setBookmarks((prev) =>
            prev.find((b) => b.id === newBookmark.id)
              ? prev
              : [newBookmark, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
    // State update is handled by the realtime DELETE event above
  };

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
        No bookmarks yet. Add your first one above!
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-800">
              {bookmark.title}
            </p>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-blue-500 hover:underline"
            >
              {bookmark.url}
            </a>
          </div>

          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            aria-label={`Delete bookmark: ${bookmark.title}`}
            className="ml-4 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deletingId === bookmark.id ? "…" : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}
