/**
 * Next.js Proxy (formerly Middleware) — runs on every request BEFORE the page renders.
 * Renamed from middleware.ts → proxy.ts in Next.js 16.
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session so it never expires silently.
 * 2. Protect /bookmarks: redirect unauthenticated users to /login.
 * 3. Redirect already-logged-in users away from /login to /bookmarks.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          // Propagate updated cookies into both the request and the response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST be awaited before any redirect logic
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated user trying to reach /bookmarks → send to /login
  if (!user && pathname.startsWith("/bookmarks")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated user visiting /login → send to /bookmarks
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/bookmarks", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - /auth/*       (OAuth callback must not be intercepted)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/).*)",
  ],
};
