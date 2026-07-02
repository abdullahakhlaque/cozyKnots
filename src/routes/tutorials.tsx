import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, Clock } from "lucide-react";
import { useState } from "react";
import { tutorials } from "@/lib/data";

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Crochet Tutorials — Hook & Loop Creations" },
      { name: "description", content: "Beginner to advanced crochet tutorials with step-by-step videos, material lists and written instructions." },
      { property: "og:title", content: "Crochet Tutorials — Hook & Loop Creations" },
      { property: "og:description", content: "Learn crochet at your own pace with cozy, easy-to-follow video lessons." },
    ],
  }),
  component: TutorialsPage,
});

function TutorialsPage() {
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const filtered = tutorials.filter((t) => level === "All" || t.level === level);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl">Learn to crochet</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Pull up a chair, grab your hook, and pick a lesson. Every tutorial has a video, materials list, and written steps.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
              level === l
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Link key={t.id} to="/tutorials/$id" params={{ id: t.id }} className="card-soft overflow-hidden group block">
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={t.image} alt={t.title} width={1200} height={800} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-14 w-14 text-white drop-shadow" />
              </div>
              <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold">{t.level}</span>
              <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${t.free ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {t.free ? "Free" : `$${t.price}`}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl leading-tight">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {t.duration}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
