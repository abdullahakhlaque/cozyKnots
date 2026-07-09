import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "A little more please").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CozyKnots" },
      { name: "description", content: "Get in touch with the CozyKnots studio about orders, custom pieces or tutorials." },
      { property: "og:title", content: "Contact — CozyKnots" },
      { property: "og:description", content: "Say hello to our tiny crochet studio." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl">Say hello</h1>
        <p className="mt-3 text-muted-foreground">
          Custom orders, tutorial questions, wholesale — we'd love to hear from you. We reply within a few days.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="inline-flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@cozyknots.co</li>
          <li className="inline-flex items-center gap-3"><MessageCircle className="h-4 w-4 text-primary" /> @cozyknots on Instagram</li>
          <li className="inline-flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Portland, Oregon</li>
        </ul>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-border bg-cream p-8 h-fit">
          <h2 className="font-display text-2xl">Thanks!</h2>
          <p className="mt-2 text-muted-foreground">Your note landed in our inbox. We'll reply soon.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input name="name" className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input name="email" type="email" className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea name="message" rows={5} className="mt-1 w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
          </div>
          <button type="submit" className="btn-primary btn-primary-hover w-full">Send message</button>
        </form>
      )}
    </div>
  );
}
