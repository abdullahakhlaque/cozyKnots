import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Search, ShoppingBag, Heart, Star, ArrowLeft, Filter, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { products, categories, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Find Products For Me — CozyKnots AI" },
      {
        name: "description",
        content: "Discover personalized handmade crochet recommendations tailored to your budget and style.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [budget, setBudget] = useState<number | "any">("any");
  const [purpose, setPurpose] = useState("Any");
  const [skillLevel, setSkillLevel] = useState("Any");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [aiSummary, setAiSummary] = useState("");
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { add } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleAddToCart = (product: Product) => {
    add(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const handleFindProducts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    const maxPrice = budget === "any" ? undefined : Number(budget);

    try {
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const res = await fetch(`http://${host}:5000/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          category: category === "All" ? undefined : category,
          maxPrice,
          purpose: purpose === "Any" ? undefined : purpose,
          skillLevel: skillLevel === "Any" ? undefined : skillLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary || "");
        
        // Map API response product IDs to local products or use returned array
        if (Array.isArray(data.products)) {
          const matched: Product[] = [];
          data.products.forEach((p: any) => {
            const found = products.find((lp) => lp.id === p.id);
            if (found) matched.push(found);
            else if (p.name && p.price) matched.push(p);
          });
          setRecommendations(matched);
        } else {
          setRecommendations([]);
        }
      } else {
        throw new Error("Backend unavailable");
      }
    } catch {
      // Local client-side recommendation engine fallback
      const qText = query.toLowerCase().trim();
      const budgetCap = maxPrice || extractBudgetFallback(qText);
      const hasSearchCriteria =
        qText.length > 0 ||
        (category && category !== "All") ||
        (purpose && purpose !== "Any") ||
        (skillLevel && skillLevel !== "Any") ||
        Boolean(budgetCap);

      const scored = products
        .map((p) => {
          let relevanceScore = 0;
          const pName = p.name.toLowerCase();
          const pDesc = p.description.toLowerCase();
          const pCat = p.category || "";

          if (budgetCap && p.price > budgetCap) return { p, score: -1 };

          if (category !== "All") {
            if (pCat.toLowerCase() !== category.toLowerCase()) return { p, score: -1 };
            relevanceScore += 10;
          }

          if (
            qText.includes("plushie") ||
            qText.includes("toy") ||
            qText.includes("bunny") ||
            qText.includes("cuddle") ||
            qText.includes("amigurumi") ||
            qText.includes("bear")
          ) {
            if (pCat === "Plushies" || pName.includes("bunny") || pName.includes("bear")) {
              relevanceScore += 12;
            } else {
              relevanceScore -= 10;
            }
          }

          if (qText.includes("bag") || qText.includes("tote") || qText.includes("carry")) {
            if (pCat === "Bags" || pName.includes("tote")) {
              relevanceScore += 12;
            } else {
              relevanceScore -= 10;
            }
          }

          if (qText.includes("clothes") || qText.includes("sweater") || qText.includes("cardigan")) {
            if (pCat === "Clothing" || pName.includes("sweater")) {
              relevanceScore += 12;
            } else {
              relevanceScore -= 10;
            }
          }

          if (qText.includes("decor") || qText.includes("coaster") || qText.includes("blanket")) {
            if (pCat === "Home Décor" || pName.includes("coaster") || pName.includes("blanket")) {
              relevanceScore += 12;
            } else {
              relevanceScore -= 10;
            }
          }

          if (qText.includes("hat") || qText.includes("beanie") || qText.includes("accessory")) {
            if (pCat === "Accessories" || pName.includes("hat")) {
              relevanceScore += 12;
            } else {
              relevanceScore -= 10;
            }
          }

          const words = qText.split(/\s+/).filter((w) => w.length > 2);
          words.forEach((w) => {
            if (pName.includes(w)) relevanceScore += 5;
            if (pCat.toLowerCase().includes(w)) relevanceScore += 5;
            if (pDesc.includes(w)) relevanceScore += 2;
          });

          if (hasSearchCriteria && relevanceScore <= 0) {
            return { p, score: -1 };
          }

          const score = relevanceScore + p.rating * 0.5;
          return { p, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

      const matchedProducts = scored.map((s) => s.p);
      setRecommendations(matchedProducts);

      if (matchedProducts.length === 0) {
        setAiSummary("No suitable products were found matching your current preferences or budget limit. Try changing your search options!");
      } else {
        const bText = budgetCap ? ` under ₹${budgetCap.toLocaleString("en-IN")}` : "";
        setAiSummary(`✨ Based on your request${bText}, we recommend **${matchedProducts[0].name}** (₹${matchedProducts[0].price.toLocaleString("en-IN")})!`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setCategory("All");
    setBudget("any");
    setPurpose("Any");
    setSkillLevel("Any");
    setHasSearched(false);
    setRecommendations([]);
    setAiSummary("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl sm:text-5xl text-foreground">Find Products For Me</h1>
            <span className="inline-flex h-8 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Recommendation
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Describe what you're looking for or pick your preferences. Knotty AI will scan our handmade collection and match the best products for you!
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline self-start md:self-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>

      {/* Interactive Finder Form Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6">
        <form onSubmit={handleFindProducts} className="space-y-6">
          {/* Natural Language Prompt Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> What are you looking for today?
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I am a beginner looking for a cute handmade plushie gift under ₹1,000..."
                className="w-full rounded-2xl border border-input bg-background pl-4 pr-12 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Analyzing..." : "Find ✨"}
              </button>
            </div>
          </div>

          {/* Quick Filters Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-border/60">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Max Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value === "any" ? "any" : Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="any">Any Price</option>
                <option value={500}>Under ₹500</option>
                <option value={1500}>Under ₹1,500</option>
                <option value={3000}>Under ₹3,000</option>
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Purpose / Recipient
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Any">Any Purpose</option>
                <option value="Gift">Gift 🎁</option>
                <option value="Personal">Personal Hug 🧸</option>
                <option value="Decor">Home Accent 🌸</option>
                <option value="Fashion">Fashion & Carry 👜</option>
              </select>
            </div>

            {/* Skill Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Crafter Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Any">Any Level</option>
                <option value="Beginner">Beginner 🟢</option>
                <option value="Intermediate">Intermediate 🟡</option>
                <option value="Advanced">Advanced 🔴</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Try clicking:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("Cute plushie under ₹1,000 for a toddler");
                  setCategory("Plushies");
                  setBudget(1000);
                }}
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                🧸 Plushie under ₹1,000
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("Roomy cotton tote bag for everyday carry");
                  setCategory("Bags");
                  setBudget(50);
                }}
                className="rounded-full bg-muted px-2.5 py-1 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                👜 Market Tote
              </button>
            </div>

            <div className="flex items-center gap-2">
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary btn-primary-hover px-6 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 shadow-cozy"
              >
                <Sparkles className="h-4 w-4" />
                {isLoading ? "Scanning catalog..." : "Find Products For Me ✨"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 animate-pulse text-xl">
            🧶
          </div>
          <h3 className="font-display text-xl text-foreground">Knotty AI is analyzing products...</h3>
          <p className="text-sm text-muted-foreground">Matching ratings, category tags, and your budget requirements.</p>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* AI Summary Banner */}
          {aiSummary && (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 sm:p-5 flex items-start gap-3 shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 text-base">
                ✨
              </div>
              <div className="text-sm leading-relaxed text-foreground/90">
                {renderFormattedSummary(aiSummary)}
              </div>
            </div>
          )}

          {/* Product Recommendations Grid */}
          {recommendations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center max-w-md mx-auto space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl">No suitable products were found.</h3>
              <p className="text-sm text-muted-foreground">Try changing your preferences, increasing your budget limit, or selecting another category.</p>
              <div className="pt-2">
                <button onClick={handleReset} className="btn-primary btn-primary-hover px-5 py-2 rounded-xl text-xs font-semibold">
                  Reset Preferences
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Recommended For You ({recommendations.length})</h2>
                <span className="text-xs text-muted-foreground">Ranked by AI relevance</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((product) => (
                  <div key={product.id} className="card-soft overflow-hidden group flex flex-col justify-between">
                    <div>
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        <Link to="/shop/$id" params={{ id: product.id }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            width={900}
                            height={900}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs text-foreground transition-transform active:scale-95 hover:bg-background hover:scale-110 shadow-xs z-10"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isInWishlist(product.id)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{product.category}</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {product.rating}
                          </span>
                        </div>

                        <Link to="/shop/$id" params={{ id: product.id }} className="block">
                          <h3 className="font-display text-lg leading-tight hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-border/50 mt-4 flex items-center justify-between gap-3">
                      <span className="font-semibold text-lg text-foreground">₹{product.price.toLocaleString("en-IN")}</span>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary btn-primary-hover px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {addedMap[product.id] ? "Added!" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function extractBudgetFallback(text: string): number | null {
  const match = text.match(/(?:under|below|less than|max|\$|₹)\s*(\d+)/i) || text.match(/(\d+)\s*(?:dollars|bucks)/i);
  if (match && match[1]) return Number(match[1]);
  return null;
}

function renderFormattedSummary(content: string) {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-semibold text-primary">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
