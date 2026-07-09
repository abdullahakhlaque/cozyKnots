import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
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
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (user) {
    // already signed in
    navigate({ to: "/profile" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email.includes("@") || pw.length < 4) {
      setErr("Please enter a valid email and password (4+ chars).");
      return;
    }
    if (mode === "login") await login(email, pw);
    else await register(name || email.split("@")[0], email, pw);
    navigate({ to: "/profile" });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save favourites, track orders, and unlock premium tutorials.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Password</label>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" className="btn-primary btn-primary-hover w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Tip: use any email with "admin" to see the admin dashboard.
        </p>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have one?{" "}
            <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
              Sign in
            </button>
          </>
        )}
      </div>
      <div className="mt-4 text-center">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back home</Link>
      </div>
    </div>
  );
}
