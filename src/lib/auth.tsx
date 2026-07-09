import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type User = { name: string; email: string; role: "customer" | "admin" };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "ck_user_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const value = useMemo<AuthCtx>(() => {
    const persist = (u: User | null) => {
      setUser(u);
      if (typeof window !== "undefined") {
        if (u) localStorage.setItem(KEY, JSON.stringify(u));
        else localStorage.removeItem(KEY);
      }
    };
    return {
      user,
      login: async (email: string) => {
        const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
        persist({ name: email.split("@")[0] || "Friend", email, role });
      },
      register: async (name, email) => {
        const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
        persist({ name, email, role });
      },
      logout: () => persist(null),
    };
  }, [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
