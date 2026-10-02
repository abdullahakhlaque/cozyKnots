import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — CozyKnots" },
      { name: "description", content: "Review the handmade crochet goods in your cart." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQty, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = total >= 1500 || total === 0 ? 0 : 99;
  const grand = total + shipping;

  const handleCheckout = () => {
    if (user) {
      navigate({ to: "/checkout" });
    } else {
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
    }
  };

  if (count === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="font-display text-3xl mt-4">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a plushie or two to get started.</p>
        <Link to="/shop" className="btn-primary btn-primary-hover mt-6 inline-flex">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-8">Your cart</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map(({ product, qty }: CartItem) => (
            <li key={product.id} className="flex gap-4 p-4">
              <img
                src={product.image}
                alt={product.name}
                width={120}
                height={120}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=1000&auto=format&fit=crop";
                }}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to="/shop/$id"
                      params={{ id: product.id }}
                      className="font-display text-lg hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{product.category}</div>
                  </div>
                  <span className="font-semibold">₹{(product.price * qty).toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button onClick={() => setQty(product.id, qty - 1)} className="h-9 w-9">
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} className="h-9 w-9">
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="text-sm text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="rounded-2xl border border-border bg-cream p-6 h-fit">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>₹{total.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 mt-3 font-semibold text-base">
              <dt>Total</dt>
              <dd>₹{grand.toLocaleString("en-IN")}</dd>
            </div>
          </dl>
          <button
            onClick={handleCheckout}
            className="btn-primary btn-primary-hover mt-6 w-full py-3 font-semibold rounded-xl text-center"
          >
            Proceed to Checkout
          </button>
          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
