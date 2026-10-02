import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Package, PlayCircle, Heart, Settings } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { products, tutorials } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Your Dashboard — CozyKnots" }, { name: "robots", content: "noindex" }],
  }),
  component: Profile,
});

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-4xl">{user.name} 🧶</h1>
          {isAdmin && (
            <span className="mt-2 inline-block rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
              Admin
            </span>
          )}
        </div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { icon: Package, label: "Orders", value: "3" },
          { icon: PlayCircle, label: "Tutorials", value: "5" },
          { icon: Heart, label: "Saved items", value: "8" },
          { icon: Settings, label: "Role", value: user.role },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-cream p-5">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-2xl font-display">{value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {isAdmin ? (
        <AdminPanel />
      ) : (
        <div className="grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl mb-4">Recent orders</h2>
            <ul className="rounded-2xl border border-border divide-y divide-border bg-card">
              {products.slice(0, 3).map((p, i) => (
                <li key={p.id} className="p-4 flex items-center gap-4">
                  <img
                    src={p.image}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Order #100{i + 1} · Shipped</div>
                  </div>
                  <span className="text-sm font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-4">Continue learning</h2>
            <ul className="space-y-3">
              {tutorials.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <Link
                    to="/tutorials/$id"
                    params={{ id: t.id }}
                    className="flex gap-4 rounded-2xl border border-border p-3 bg-card hover:bg-muted transition-colors"
                  >
                    <img
                      src={t.image}
                      alt=""
                      width={96}
                      height={64}
                      loading="lazy"
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.level} · {t.duration}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl mb-4">Products</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left">
              <tr>
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 font-semibold text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    {p.name}
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-right font-semibold">${p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl mb-4">Tutorials</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tutorials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-4 flex gap-4">
              <img
                src={t.image}
                alt=""
                width={96}
                height={64}
                loading="lazy"
                className="h-16 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {t.level} · {t.free ? "Free" : `$${t.price}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
