import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/recommendations", label: "AI Finder ✨" },
  { to: "/identify", label: "Identify Crochet ✨" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth(); // If your AuthProvider sets user details, we can check it here
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg">
            &amp;
          </span>
          <span className="font-display text-xl">CozyKnots</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-primary hover:underline transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            to="/wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
