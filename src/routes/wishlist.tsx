import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2, Star, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — CozyKnots" },
      {
        name: "description",
        content: "View your saved handmade crochet plushies, bags, sweaters and home décor.",
      },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, remove } = useWishlist();
  const { add } = useCart();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: (typeof items)[0]) => {
    add(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl sm:text-5xl">My Wishlist</h1>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              {items.length}
            </span>
          </div>
          <p className="text-muted-foreground mt-2">
            Your saved handmade favorites, ready whenever you are.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl text-foreground">Your Wishlist is empty.</h2>
          <p className="text-sm text-muted-foreground">
            Explore our store shelves and tap the heart icon on any plushie, tote, or accessory to save it here!
          </p>
          <div className="pt-2">
            <Link to="/shop" className="btn-primary btn-primary-hover inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm">
              <ShoppingBag className="h-4 w-4" /> Explore Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
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
                    onClick={() => remove(product.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-xs z-10"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.category}</span>
                    <span className="inline-flex items-center gap-1">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary btn-primary-hover px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {addedMap[product.id] ? "Added!" : "Add to Cart"}
                  </button>

                  <button
                    onClick={() => remove(product.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
