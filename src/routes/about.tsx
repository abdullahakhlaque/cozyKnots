import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hook & Loop Creations" },
      { name: "description", content: "The story behind Hook & Loop Creations — a small crochet studio making cozy handmade goods and teaching the craft." },
      { property: "og:title", content: "About Hook & Loop Creations" },
      { property: "og:description", content: "A tiny studio, a big yarn stash, and a love for teaching the craft." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="font-display text-5xl">Made by hand, meant to last.</h1>
          <p className="mt-5 text-muted-foreground text-lg">
            Hook &amp; Loop Creations is a one-person crochet studio founded in 2021.
            We make cozy things, teach the craft, and champion slow, thoughtful making.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-2 items-center">
        <img src={heroImg} alt="Crochet items and yarn" width={1600} height={1200} loading="lazy" className="rounded-3xl shadow-soft aspect-[4/3] object-cover" />
        <div>
          <h2 className="font-display text-3xl">Our story</h2>
          <p className="mt-4 text-muted-foreground">
            It started with a single skein of cream cotton and a shaky first granny square. Five years later, our studio ships handmade goods around the world and hosts thousands of learners inside our tutorial library.
          </p>
          <p className="mt-3 text-muted-foreground">
            We believe every stitch should mean something — that's why we make in small batches, source natural fibres and teach patiently.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 grid gap-6 sm:grid-cols-3">
        {[
          { k: "5,000+", v: "Handmade orders shipped" },
          { k: "80+", v: "Tutorials in the library" },
          { k: "100%", v: "Natural-fibre yarn" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-cream p-6 text-center">
            <div className="font-display text-3xl text-primary">{s.k}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
