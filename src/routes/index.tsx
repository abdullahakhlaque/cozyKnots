import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, PlayCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { products, getAllTutorials, subscribeToTutorialChanges, type Tutorial } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = products.slice(0, 4);
  const [trending, setTrending] = useState<Tutorial[]>([]);

  useEffect(() => {
    let active = true;
    const loadTutorials = async () => {
      const list = getAllTutorials();
      if (active) setTrending(list.slice(0, 3));
    };

    void loadTutorials();
    return subscribeToTutorialChanges(() => void loadTutorials());
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Handmade in small batches
            </span>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl leading-[1.05]">
              Cozy things,
              <br />
              <span className="text-primary italic">stitch by stitch.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg">
              Shop soft handmade crochet goods, or pick up a hook and learn a new stitch with our
              beginner-to-advanced video tutorials.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary btn-primary-hover">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tutorials"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <PlayCircle className="h-4 w-4" /> Watch tutorials
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <span className="ml-1">4.9 · 320+ reviews</span>
              </div>
              <span className="hidden sm:inline">Free shipping over $75</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-lavender/40 blur-2xl" aria-hidden />
            <img
              src={heroImg}
              alt="Handmade crochet bag, bunny plushie and pastel yarn balls"
              width={1600}
              height={1200}
              className="relative w-full h-auto rounded-3xl shadow-soft object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Featured pieces</h2>
            <p className="text-muted-foreground mt-1">Newest additions to the studio.</p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
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
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{p.category}</div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                  <span className="font-semibold">${p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Story band */}
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-3 items-center">
          <div className="md:col-span-2">
            <h2 className="font-display text-3xl sm:text-4xl">
              A little studio, a big yarn stash.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Every plushie, tote and blanket is stitched by hand in our sunny corner studio. We use
              natural fibres, gentle dyes and patterns tested in our own home.
            </p>
          </div>
          <Link
            to="/about"
            className="justify-self-start md:justify-self-end btn-primary btn-primary-hover"
          >
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Tutorials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Trending tutorials</h2>
            <p className="text-muted-foreground mt-1">Learn a new stitch this weekend.</p>
          </div>
          <Link
            to="/tutorials"
            className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {trending.map((t) => (
            <Link
              key={t.id}
              to="/tutorials/$id"
              params={{ id: t.id }}
              className="card-soft overflow-hidden group block"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={t.image}
                  alt={t.title}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-14 w-14 text-white drop-shadow" />
                </div>
                <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold">
                  {t.level}
                </span>
                {t.free && (
                  <span className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                    Free
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl leading-tight">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">{t.duration}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-blush/50 p-8 sm:p-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">Join the cozy list</h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            New patterns, first-look drops and the occasional yarn sale — sent slowly, never spammy.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-full bg-background border border-border px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="btn-primary btn-primary-hover">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
