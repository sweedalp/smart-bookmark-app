/**
 * Supabase BROWSER client (used in Client Components).
 *
 * We use `@supabase/ssr` so that auth cookies are shared between the
 * browser and the Next.js server-side rendering layer seamlessly.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
