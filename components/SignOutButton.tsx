/**
 * SignOutButton — Client Component
 *
 * Calls supabase.auth.signOut() then navigates to /login.
 * Kept as a tiny separate client component so the parent
 * BookmarksPage can remain a Server Component.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-xl px-4 py-2 text-[12px] font-semibold transition-all duration-150 active:scale-[0.97]"
      style={{
        color: '#6b7280',
        background: '#ffffff',
        border: '1px solid #e5e0d8',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = '#faf9f7';
        b.style.borderColor = '#c9c4bb';
        b.style.color = '#374151';
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = '#ffffff';
        b.style.borderColor = '#e5e0d8';
        b.style.color = '#6b7280';
      }}
    >
      Sign out
    </button>
  );
}
