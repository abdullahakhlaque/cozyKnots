import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — CozyKnots" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const shipping = total >= 75 || total === 0 ? 0 : 6;
  const grand = total + shipping;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    clear();
    setTimeout(() => navigate({ to: "/" }), 3500);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <CheckCircle2 className="h-14 w-14 mx-auto text-primary" />
        <h1 className="font-display text-3xl mt-4">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you — a confirmation is on its way to your inbox.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary btn-primary-hover mt-6 inline-flex">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required />
              <Field label="Email" type="email" required />
            </div>
          </fieldset>
          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg">Shipping</legend>
            <div className="grid gap-4">
              <Field label="Address" required />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" required />
                <Field label="State" required />
                <Field label="Zip" required />
              </div>
            </div>
          </fieldset>
          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-2 font-display text-lg">Payment</legend>
            <p className="text-xs text-muted-foreground mb-4">Demo checkout — no real card is charged.</p>
            <div className="grid gap-4">
              <Field label="Card number" placeholder="4242 4242 4242 4242" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Expiry" placeholder="MM / YY" required />
                <Field label="CVC" placeholder="123" required />
              </div>
            </div>
          </fieldset>
        </div>

        <aside className="rounded-2xl border border-border bg-cream p-6 h-fit">
          <h2 className="font-display text-xl mb-4">Summary</h2>
          <ul className="space-y-3 text-sm max-h-64 overflow-auto">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{product.name} × {qty}</span>
                <span>${(product.price * qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${total.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><dt>Total</dt><dd>${grand.toFixed(2)}</dd></div>
          </dl>
          <button type="submit" className="btn-primary btn-primary-hover mt-6 w-full">Place order</button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
