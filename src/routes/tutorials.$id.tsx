import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Check, Clock, Lock, FileText, Download } from "lucide-react";
import { getTutorial, getVideoEmbedUrl, openTutorialPdf, type Tutorial } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/tutorials/$id")({
  loader: async ({ params }): Promise<Tutorial> => {
    try {
      const res = await fetch(`http://localhost:5000/api/tutorials/${params.id}`);
      if (res.ok) {
        const tutorial = (await res.json()) as Tutorial;
        if (tutorial) return tutorial;
      }
    } catch {
      // Fall back to local browser storage when the backend is offline.
    }

    const t = await getTutorial(params.id);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Tutorial` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.image },
        ]
      : [{ title: "Tutorial not found" }, { name: "robots", content: "noindex" }],
  }),
  component: TutorialPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Tutorial not found</h1>
      <Link to="/tutorials" className="btn-primary btn-primary-hover mt-6 inline-flex">
        Browse tutorials
      </Link>
    </div>
  ),
});

function TutorialPage() {
  const t = Route.useLoaderData();
  const { user } = useAuth();
  const locked = !t.free && !user;
  const videoUrl = getVideoEmbedUrl(t.videoUrl);
  const isDirectVideo = /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(videoUrl);

  const handleOpenPattern = () => {
    openTutorialPdf(t);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/tutorials"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All tutorials
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold">
          {t.level}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {t.duration}
        </span>
        {!t.free && (
          <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            Premium · ${t.price}
          </span>
        )}
      </div>
      <h1 className="font-display text-4xl">{t.title}</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">{t.description}</p>

      <div className="mt-8 relative rounded-3xl overflow-hidden bg-muted aspect-video shadow-soft">
        {locked ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${t.image})` }}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <Lock className="h-10 w-10 text-primary mb-3" />
              <h2 className="font-display text-2xl">Sign in to watch</h2>
              <p className="text-muted-foreground mt-2 max-w-sm">
                This is a premium tutorial. Sign in or create an account to unlock the full video
                and pattern PDF.
              </p>
              <Link to="/auth" className="btn-primary btn-primary-hover mt-5">
                Sign in to unlock
              </Link>
            </div>
          </div>
        ) : isDirectVideo ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <iframe
            src={videoUrl}
            title={t.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
          <Bookmark className="h-4 w-4" /> Bookmark
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
          <Check className="h-4 w-4" /> Mark complete
        </button>
        <button
          type="button"
          onClick={handleOpenPattern}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
        >
          <FileText className="h-4 w-4" /> Open Pattern (PDF)
        </button>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl mb-4">Step by step</h2>
          <ol className="space-y-4">
            {t.steps.map((s: string, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {i + 1}
                </span>
                <p className="text-foreground/90">{s}</p>
              </li>
            ))}
          </ol>
        </div>
        <aside>
          <div className="rounded-2xl border border-border bg-cream p-5 space-y-4">
            <div>
              <h3 className="font-display text-lg mb-3">You'll need</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.materials.map((m: string) => (
                  <li key={m} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" /> {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-border/80">
              <h4 className="font-display text-sm font-semibold mb-2 flex items-center gap-1 text-emerald-800">
                <FileText className="h-4 w-4" /> Printable Pattern
              </h4>
              <button
                type="button"
                onClick={handleOpenPattern}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-2 text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Open Pattern PDF
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
