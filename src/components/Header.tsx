import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google"; // <-- Added Google Import

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
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

        <div className="flex items-center gap-3"> {/* Adjusted gap slightly for Google button */}
          
          {/* If user is logged in, show profile icon. Otherwise, show Google Sign-In */}
          {user ? (
            <Link
              to="/profile"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <div className="hidden sm:block">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log("Google Login Token:", credentialResponse.credential);
                  // TODO: Connect this token to your backend or update your useAuth() system
                }}
                onError={() => {
                  console.log("Google Login Failed");
                }}
                useOneTap
                theme="outline"
                shape="pill"
                size="medium"
              />
            </div>
          )}

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
            
            {/* Added Google Sign-In button inside the mobile drawer menu when logged out */}
            {!user && (
              <div className="pt-2">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log("Google Login Token:", credentialResponse.credential);
                  }}
                  onError={() => {
                    console.log("Google Login Failed");
                  }}
                  theme="outline"
                  width="100%"
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
