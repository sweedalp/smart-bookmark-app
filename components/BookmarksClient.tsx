/**
 * BookmarksClient — single Client Component that owns ALL bookmark state.
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";

export default function BookmarksClient({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Realtime (other tabs / devices) ── */
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bookmarks-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookmarks" }, (payload) => {
        const b = payload.new as Bookmark;
        if (b.user_id !== userId) return;
        setBookmarks((prev) => prev.find((x) => x.id === b.id) ? prev : [b, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "bookmarks" }, (payload) => {
        const id = (payload.old as { id: string }).id;
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  /* ── Add ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try { new URL(url); } catch { setFormError("Please enter a valid URL (include https://)"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ user_id: userId, title: title.trim(), url: url.trim() })
      .select().single();
    setSaving(false);
    if (error) { setFormError(error.message); }
    else {
      setBookmarks((prev) => prev.find((b) => b.id === data.id) ? prev : [data as Bookmark, ...prev]);
      setTitle(""); setUrl("");
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setDeletingId(null);
  };

  const getFavicon = (rawUrl: string) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(rawUrl).hostname}&sz=32`; }
    catch { return null; }
  };

  const formatDomain = (rawUrl: string) => {
    try { return new URL(rawUrl).hostname.replace(/^www\./, ""); }
    catch { return rawUrl; }
  };

  return (
    <>
      {/* ── Add Form ── */}
      <section className="animate-scale-in mb-8">
        <form onSubmit={handleAdd}>
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              background: "#ffffff",
              border: "1px solid #e8e3db",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
            }}
          >
            {/* Fields */}
            <div className="flex flex-col gap-0">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-5 py-3.5 text-sm transition"
                style={{
                  background: "transparent",
                  borderBottom: "1px solid #f0ece6",
                  color: "#111827",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.background = "#fdfcfb")}
                onBlur={(e) => (e.currentTarget.style.background = "transparent")}
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-5 py-3.5 text-sm transition"
                style={{
                  background: "transparent",
                  color: "#111827",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.background = "#fdfcfb")}
                onBlur={(e) => (e.currentTarget.style.background = "transparent")}
              />
            </div>

            {/* Submit row */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid #f0ece6", background: "#faf9f7" }}
            >
              {formError ? (
                <p className="text-[12px]" style={{ color: "#dc2626" }}>{formError}</p>
              ) : (
                <p className="text-[12px]" style={{ color: "#c8c3bb" }}>
                  Press Save or hit Enter
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d52 100%)",
                  boxShadow: "0 2px 8px rgba(26,26,46,0.2)",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(26,26,46,0.3)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(26,26,46,0.2)")}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ── Section label ── */}
      {bookmarks.length > 0 && (
        <div className="mb-3 flex items-center justify-between px-1">
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "#c5bfb7" }}
          >
            Saved &nbsp;·&nbsp; {bookmarks.length}
          </span>
        </div>
      )}

      {/* ── Empty state ── */}
      {bookmarks.length === 0 ? (
        <div
          className="animate-fade-in flex flex-col items-center justify-center rounded-3xl py-20"
          style={{
            border: "1.5px dashed #e5dfd7",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: "#f5f2ee",
              border: "1px solid #e8e3db",
            }}
          >
            🔖
          </div>
          <p className="text-sm font-semibold" style={{ color: "#9ca3af" }}>
            Nothing saved yet
          </p>
          <p className="mt-1 text-[12px]" style={{ color: "#d1cdc7" }}>
            Add your first bookmark above
          </p>
        </div>
      ) : (
        /* ── List ── */
        <ul
          className="overflow-hidden rounded-3xl"
          style={{
            border: "1px solid #e8e3db",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {bookmarks.map((bookmark, i) => (
            <li
              key={bookmark.id}
              className="animate-fade-up group flex items-center justify-between bg-white px-4 py-3.5 transition-colors duration-100"
              style={{
                borderBottom: i < bookmarks.length - 1 ? "1px solid #f2ede7" : "none",
                animationDelay: `${Math.min(i * 0.04, 0.24)}s`,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLLIElement).style.background = "#faf8f5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLLIElement).style.background = "#ffffff")}
            >
              {/* Favicon + text */}
              <div className="flex min-w-0 items-center gap-3.5">
                <div
                  className="favicon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "#f5f2ee",
                    border: "1px solid #eae5de",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFavicon(bookmark.url) ?? ""}
                    alt=""
                    width={16}
                    height={16}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>

                <div className="min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-[13.5px] font-semibold leading-tight hover:underline"
                    style={{ color: "#111827", textDecorationColor: "#c9c4bb", letterSpacing: "-0.01em" }}
                  >
                    {bookmark.title}
                  </a>
                  <p
                    className="mt-0.5 truncate text-[11.5px]"
                    style={{ color: "#b5b0a8" }}
                  >
                    {formatDomain(bookmark.url)}
                  </p>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all duration-100 group-hover:opacity-100 active:scale-90 disabled:opacity-40"
                style={{
                  color: "#9ca3af",
                  background: "transparent",
                }}
                title="Delete"
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "#fee2e2";
                  b.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "transparent";
                  b.style.color = "#9ca3af";
                }}
              >
                {deletingId === bookmark.id ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
