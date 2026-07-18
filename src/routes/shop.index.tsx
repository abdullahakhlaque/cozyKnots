import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { products, categories, type Product } from "@/lib/data";

type ShopSearch = { category?: string; q?: string };

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — CozyKnots" },
      { name: "description", content: "Browse handmade crochet bags, plushies, sweaters, accessories and home décor." },
      { property: "og:title", content: "Shop — CozyKnots" },
      { property: "og:description", content: "Handmade crochet goods, small batch and full of character." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [query, setQuery] = useState(q ?? "");

  const active = category ?? "All";

  const filtered = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesCat = active === "All" || p.category === active;
      const matchesQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [active, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl">The Shop</h1>
        <p className="text-muted-foreground mt-2">Handmade with natural fibres, ready to ship in 3–5 days.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() =>
                navigate({ search: (prev: ShopSearch) => ({ ...prev, category: c === "All" ? undefined : c }) })
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                active === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              navigate({ search: (prev: ShopSearch) => ({ ...prev, q: v || undefined }) });
            }}
            placeholder="Search products…"
            className="w-full rounded-full bg-background border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          Nothing here yet. Try another category.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/shop/$id"
              params={{ id: p.id }}
              className="card-soft overflow-hidden group block"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  width={900}
                  height={900}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {p.rating}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                  <span className="font-semibold">${p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
