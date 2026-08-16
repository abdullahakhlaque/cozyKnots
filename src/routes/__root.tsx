import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google"; // <-- Added Google import

import appCss from "../styles.css?url";
import { CartProvider } from "../lib/cart";
import { AuthProvider } from "../lib/auth";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 font-display text-2xl">This page unraveled</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like a loose thread — the page you're after isn't here.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary btn-primary-hover">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="max-w-lg text-center space-y-4 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h1 className="font-display text-3xl text-primary">Something got tangled</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred. You can refresh or return home."}
        </p>
        {error?.stack && (
          <div className="text-left bg-muted/60 p-3 rounded-xl max-h-36 overflow-auto text-xs font-mono text-destructive">
            {error.stack.split("\n").slice(0, 4).join("\n")}
          </div>
        )}
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary btn-primary-hover px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CozyKnots — Handmade Crochet Shop & Tutorials" },
      {
        name: "description",
        content:
          "Shop cozy handmade crochet goods — bags, plushies, sweaters and home décor — and learn to crochet with beginner to advanced video tutorials.",
      },
      { name: "author", content: "CozyKnots" },
      { property: "og:title", content: "CozyKnots — Handmade Crochet Shop & Tutorials" },
      {
        property: "og:description",
        content: "Handmade crochet marketplace and cozy learning hub for crafters at every level.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Nunito:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Added Google Provider to wrap your authentication system */}
      <GoogleOAuthProvider clientId="://googleusercontent.com">
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
