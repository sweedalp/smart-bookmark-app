/**
 * /auth/callback — OAuth code exchange route.
 *
 * After Google authenticates the user, Google redirects to this URL
 * with ?code=<authorization_code>.  We exchange that code for a
 * Supabase session, store auth cookies, and redirect to /bookmarks.
 *
 * This is a Next.js Route Handler (GET only).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/bookmarks";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
