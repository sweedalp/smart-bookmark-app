/**
 * Shared TypeScript types for the app.
 */

export interface Bookmark {
  id: string;           // UUID from Supabase
  user_id: string;      // FK → auth.users
  title: string;
  url: string;
  created_at: string;   // ISO timestamp
}
