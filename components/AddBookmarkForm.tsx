/**
 * AddBookmarkForm — Client Component
 *
 * Renders a form with two fields (Title, URL) and calls the Supabase
 * client to INSERT a new bookmark for the current user.
 *
 * Why Client Component?
 * We need browser events (onChange, onSubmit) and we access the
 * Supabase browser client directly to insert the row.
 */
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddBookmarkForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (include https://)");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("bookmarks").insert({
      user_id: userId,
      title: title.trim(),
      url: url.trim(),
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      // Clear the form on success.
      // The new bookmark will appear via the realtime subscription in BookmarkList.
      setTitle("");
      setUrl("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold">Add a Bookmark</h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </form>
  );
}
