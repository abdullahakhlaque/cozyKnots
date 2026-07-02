import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-display">
              &amp;
            </span>
            <span className="font-display text-xl">Hook &amp; Loop</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Handmade crochet goods and cozy tutorials, made with love in small batches.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/shop" search={{ category: "Plushies" }} className="hover:text-foreground">Plushies</Link></li>
            <li><Link to="/shop" search={{ category: "Bags" }} className="hover:text-foreground">Bags</Link></li>
            <li><Link to="/shop" search={{ category: "Home Décor" }} className="hover:text-foreground">Home Décor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Learn</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tutorials" className="hover:text-foreground">All tutorials</Link></li>
            <li><Link to="/about" className="hover:text-foreground">Our story</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Stay in touch</h4>
          <div className="flex gap-3">
            <a href="#" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href="mailto:hello@hookandloop.co" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Hook &amp; Loop Creations</span>
          <span className="inline-flex items-center gap-1">Made with <Heart className="h-3 w-3 fill-primary text-primary" /> and yarn</span>
        </div>
      </div>
    </footer>
  );
}
