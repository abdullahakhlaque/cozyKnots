import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, Check, Truck, CreditCard, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user && typeof window !== "undefined" && !window.localStorage.getItem("ck_user_v1")) {
      // Cart items already persist locally, so they remain available after registration.
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
    }
  }, [user, navigate]);

  if (!user && typeof window !== "undefined" && !window.localStorage.getItem("ck_user_v1")) {
    return null;
  }

  const [shipping, setShipping] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  // Redirect if cart is empty
  if (items.length === 0 && !placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary btn-primary-hover inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          qty: i.qty,
        })),
        shipping,
        total,
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to place order");
      }

      const data = await res.json();
      setPlacedOrder({
        orderId: data.orderId,
        items: orderData.items,
        shipping: orderData.shipping,
        total: orderData.total,
      });
      clear();
      toast.success(`Order ${data.orderId} confirmed successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="card-soft p-8 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10" />
          </div>
          <div>
            <h1 className="font-display text-3xl mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground text-sm">
              Your order has been received and stored in our database.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/60 p-4 text-left text-sm space-y-3">
            <div className="flex justify-between border-b border-border/60 pb-2 font-mono text-xs">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-bold text-foreground">{placedOrder.orderId}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Deliver To:
              </span>
              <p className="font-medium">
                {placedOrder.shipping.name} ({placedOrder.shipping.email})
              </p>
              <p className="text-muted-foreground text-xs">
                {placedOrder.shipping.address}, {placedOrder.shipping.city},{" "}
                {placedOrder.shipping.state} {placedOrder.shipping.zip}
              </p>
            </div>

            <div className="pt-2 border-t border-border/60 flex justify-between font-medium">
              <span>Total Amount Paid:</span>
              <span className="text-primary font-bold">${placedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/shop"
            className="btn-primary btn-primary-hover inline-flex w-full justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="font-display text-4xl mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card-soft p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                className="w-full rounded-xl border-border bg-background/50 p-3"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                className="w-full rounded-xl border-border bg-background/50 p-3"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Street address"
              value={shipping.address}
              onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              className="w-full rounded-xl border-border bg-background/50 p-3"
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                className="w-full rounded-xl border-border bg-background/50 p-3"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                className="w-full rounded-xl border-border bg-background/50 p-3"
                required
              />
              <input
                type="text"
                placeholder="ZIP code"
                value={shipping.zip}
                onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                className="w-full rounded-xl border-border bg-background/50 p-3"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Country"
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
              className="w-full rounded-xl border-border bg-background/50 p-3"
              required
            />

            <div className="flex items-center gap-2 mt-6 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl">Payment</h2>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Cash on Delivery (COD) — Pay when your order arrives
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-4 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Placing order...</span>
              ) : (
                <>
                  Place Order <Check className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card-soft p-6 sticky top-24">
            <h2 className="font-display text-xl mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map(
                (item: { product: { id: string; name: string; price: number }; qty: number }) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x{item.qty}
                    </span>
                    <span>${(item.product.price * item.qty).toFixed(2)}</span>
                  </div>
                ),
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
