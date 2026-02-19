/**
 * Root layout — wraps every page in the app.
 * Sets global font, metadata, and imports Tailwind styles.
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markd — Smart Bookmarks",
  description: "Save and access your bookmarks in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ background: '#f8f7f4', color: '#1a1a2e' }}>
        {children}
      </body>
    </html>
  );
}
