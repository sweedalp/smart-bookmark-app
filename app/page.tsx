/**
 * Root page — immediately redirect to /bookmarks.
 * Middleware will bounce unauthenticated users to /login.
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/bookmarks");
}
