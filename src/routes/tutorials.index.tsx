import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, AlertTriangle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAllTutorials,
  getVideoEmbedUrl,
  openTutorialPdf,
  subscribeToTutorialChanges,
  type Tutorial,
} from "@/lib/data";

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export const Route = createFileRoute("/tutorials/")({
  head: () => ({
    meta: [
      { title: "Crochet Tutorials — CozyKnots" },
      {
        name: "description",
        content:
          "Beginner to advanced crochet tutorials with step-by-step videos, material lists and written instructions.",
      },
      { property: "og:title", content: "Crochet Tutorials — CozyKnots" },
      {
        property: "og:description",
        content: "Learn crochet at your own pace with cozy, easy-to-follow video lessons.",
      },
    ],
  }),
  component: TutorialsPage,
});

function TutorialsPage() {
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const [tutorialList, setTutorialList] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTutorials = async () => {
      try {
        const local = getAllTutorials();
        const localMap = new Map((Array.isArray(local) ? local : []).map((t) => [t.id, t]));

        try {
          const res = await fetch("http://localhost:5000/api/tutorials");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            list.forEach((tutorial: Tutorial) => localMap.set(tutorial.id, tutorial));
            const merged = [...localMap.values()];
            if (!cancelled) {
              setTutorialList(merged);
              setError(null);
            }
            return;
          }
        } catch {
          // Fall back to the browser-local store when the backend is offline.
        }

        if (!cancelled) {
          setTutorialList(local);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load tutorials.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadTutorials();
    const unsubscribe = subscribeToTutorialChanges(() => {
      void loadTutorials();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const filtered = tutorialList.filter((t) => level === "All" || t.level === level);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl">Learn to crochet</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Pull up a chair, grab your hook, and pick a lesson. Every tutorial has a video, materials
          list, and printable pattern guide.
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

      {loading && <p className="text-sm text-muted-foreground">Loading tutorials…</p>}

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Database Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
            <p className="text-xs text-destructive/60 mt-1">
              Go to MongoDB Atlas → Clusters → click "Resume" on Cluster0, then refresh this page.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-muted-foreground italic">No tutorials found.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TutorialCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}

function TutorialCard({ t }: { t: Tutorial }) {
  const [isHovered, setIsHovered] = useState(false);

  const previewUrl = getVideoEmbedUrl(t.videoUrl);
  const isYouTube = previewUrl.includes("youtube.com") || previewUrl.includes("youtu.be");
  const isDirectVideo =
    previewUrl &&
    !isYouTube &&
    (previewUrl.endsWith(".mp4") || previewUrl.endsWith(".webm") || previewUrl.endsWith(".mov"));

  return (
    <div className="card-soft overflow-hidden group block">
      <Link
        to="/tutorials/$id"
        params={{ id: t.id }}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {/* Default: always show cover image */}
          <img
            src={t.image}
            alt={t.title}
            width={1200}
            height={800}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 ${isHovered ? "scale-105" : ""}`}
            style={{ display: isHovered && (isYouTube || isDirectVideo) ? "none" : "block" }}
          />

          {/* Hover: play YouTube video */}
          {isHovered && isYouTube && (
            <iframe
              src={`${previewUrl}${previewUrl.includes("?") ? "&" : "?"}autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
              title={t.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full absolute inset-0"
            />
          )}

          {/* Hover: play direct video file */}
          {isHovered && isDirectVideo && (
            <video
              src={previewUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover absolute inset-0"
            />
          )}

          <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold">
            {t.level}
          </span>
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${t.free ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {t.free ? "Free" : `$${t.price}`}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <Link to="/tutorials/$id" params={{ id: t.id }}>
          <h3 className="font-display text-xl leading-tight hover:text-primary transition-colors">
            {t.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {t.duration}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <Link
            to="/tutorials/$id"
            params={{ id: t.id }}
            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Open lesson
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTutorialPdf(t);
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" /> Download pattern
          </button>
        </div>
      </div>
    </div>
  );
}
