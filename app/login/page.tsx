/**
 * /login page — signs the user in with Google OAuth.
 */
"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "#f5f3ef" }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(99,102,241,0.07)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(251,191,36,0.06)" }}
      />

      <div
        className="animate-scale-in relative z-10 w-full max-w-[380px] rounded-3xl p-10 text-center"
        style={{
          background: "#ffffff",
          border: "1px solid #e8e4dc",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.02), 0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo mark */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d52 100%)",
              boxShadow: "0 4px 14px rgba(26,26,46,0.25)",
            }}
          >
            🔖
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#111827", letterSpacing: "-0.03em" }}
            >
              Markd
            </h1>
            <p className="mt-0.5 text-[13px] font-normal" style={{ color: "#9ca3af" }}>
              Your private bookmark space
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "#f0ede8" }} />
          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "#d1cdc7" }}>
            Sign in to continue
          </span>
          <div className="h-px flex-1" style={{ background: "#f0ede8" }} />
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "#fff",
            border: "1px solid #e2ddd7",
            color: "#374151",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#fafaf9";
            b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.09)";
            b.style.borderColor = "#cdc8c0";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#fff";
            b.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            b.style.borderColor = "#e2ddd7";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.16 2.84l6.06-6.06C34.47 3.19 29.57 1 24 1 14.8 1 6.97 6.49 3.37 14.34l7.08 5.5C12.14 14.02 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.52 24.5c0-1.55-.14-3.04-.38-4.5H24v8.52h12.68c-.55 2.95-2.2 5.45-4.68 7.13l7.19 5.59C43.58 37.25 46.52 31.33 46.52 24.5z" />
            <path fill="#FBBC05" d="M10.45 28.84A14.54 14.54 0 0 1 9.5 24c0-1.69.29-3.31.81-4.84l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.87.92 7.53 2.54 10.77l7.91-5.93z" />
            <path fill="#34A853" d="M24 47c5.57 0 10.24-1.84 13.66-5l-7.19-5.59c-1.84 1.24-4.19 1.97-6.47 1.97-6.4 0-11.86-4.52-13.55-10.54l-7.91 5.93C6.97 41.51 14.8 47 24 47z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-[11px]" style={{ color: "#c8c3bb" }}>
          No passwords &nbsp;·&nbsp; No tracking &nbsp;·&nbsp; Real-time sync
        </p>
      </div>
    </main>
  );
}

