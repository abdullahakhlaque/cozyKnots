import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

type AuthSearch = { redirect?: string };

// Determine API Base URL dynamically for production/development fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — CozyKnots" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { login, register, user } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">(
    search.redirect === "/checkout" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTarget =
    search.redirect ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null);

  // 1. --- GOOGLE OAUTH CALLBACK HANDLER ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuthToken = params.get("google_auth");

    if (googleAuthToken) {
      try {
        const userData = JSON.parse(atob(googleAuthToken));
        localStorage.setItem("user", JSON.stringify(userData));

        // Clean up URL parameters immediately to prevent multiple triggers
        const url = new URL(window.location.href);
        url.searchParams.delete("google_auth");
        window.history.replaceState({}, document.title, url.pathname + url.search);

        if (redirectTarget) {
          window.location.href = redirectTarget;
        } else {
          window.location.href = userData.role === "admin" ? "/admin" : "/profile";
        }
      } catch (error) {
        console.error("Failed to parse secure google token:", error);
        setErr("Google authentication failed. Please try manually.");
      }
    }
  }, [redirectTarget]);

  // 2. --- SESSION REDIRECT WATCHER ---
  useEffect(() => {
    if (user) {
      if (redirectTarget) {
        navigate({ to: redirectTarget as any });
      } else if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/profile" });
      }
    }
  }, [user, redirectTarget, navigate]);

  // 3. --- FORM SUBMIT HANDLER ---
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    setErr("");
    
    if (!email.includes("@") || pw.length < 4) {
      setErr("Please enter a valid email and password (4+ chars).");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await login(email, pw);
      } else {
        if (!name.trim()) {
          setErr("Please enter your name.");
          setLoading(false);
          return;
        }
        await register(name, email, pw);
      }
      // Note: The redirection step is safely handled by the useEffect session watcher above.
    } catch (apiErr: any) {
      setErr(apiErr?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {redirectTarget === "/checkout"
            ? "Create your account to continue securely to checkout."
            : "Save favourites, track orders, and unlock premium tutorials."}
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Password</label>
          <input
            value={pw}
            required
            onChange={(e) => setPw(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary btn-primary-hover w-full py-2.5 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : mode === "login" ? "Sign in & Continue" : "Create Account & Continue"}
        </button>

        {/* --- VISUAL GOOGLE SIGN IN SEPARATOR AND BUTTON --- */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or continue with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            const loginUrl = redirectTarget 
              ? `${API_BASE_URL}/api/auth/google?redirect=${encodeURIComponent(redirectTarget)}`
              : `${API_BASE_URL}/api/auth/google`;
            window.location.href = loginUrl;
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors text-foreground"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.49 7.5l3.78 2.93c.89-2.67 3.39-4.39 6.73-4.39z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.55z"/>
            <path fill="#FBBC05" d="M5.27 14.57c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.49 7.28C.54 9.17 0 11.27 0 13.5s.54 4.33 1.49 6.22l3.78-2.93z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.34 0-5.84-1.72-6.73-4.39L1.49 16.86C3.4 20.71 7.35 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Tip: Log in with <strong>admin@gmail.com</strong> to access the admin control panel.
        </p>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-primary font-semibold hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have one?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </div>
      <div className="mt-4 text-center">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
