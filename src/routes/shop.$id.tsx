import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, ShoppingBag, Star, Truck } from "lucide-react";
import { useState } from "react";
import { getProduct, products, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/shop/$id")({
  loader: ({ params }): Product => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — CozyKnots` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.image },
        ]
      : [{ title: "Product not found" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <p className="mt-3 text-muted-foreground">This piece may have sold out or moved.</p>
      <Link to="/shop" className="btn-primary btn-primary-hover mt-6 inline-flex">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { add } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-3xl overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            width={900}
            height={900}
            className="w-full h-auto object-cover aspect-square"
          />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{product.category}</div>
          <h1 className="font-display text-4xl mt-1">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" /> {product.rating} · 42 reviews
            </span>
          </div>
          <p className="mt-5 text-muted-foreground">{product.description}</p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" /> Ships in 3–5 days · Free over ₹1,500
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-lg"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="h-11 w-11 text-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                add(product, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1600);
              }}
              className="btn-primary btn-primary-hover flex-1"
            >
              <ShoppingBag className="h-4 w-4" />
              {added ? "Added!" : "Add to cart"}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-muted transition-transform active:scale-95"
              aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isInWishlist(product.id)
                    ? "fill-primary text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              />
            </button>
          </div>

          <div className="mt-8 text-xs text-muted-foreground">
            {product.stock > 0
              ? `${product.stock} in stock — made to order after that.`
              : "Sold out"}
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-2xl mb-6">You might also love</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {related.map((p) => (
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
              <div className="p-4 flex items-baseline justify-between">
                <h3 className="font-display text-lg">{p.name}</h3>
                <span className="font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
