import bagImg from "@/assets/product-bag.jpg";
import bunnyImg from "@/assets/product-bunny.jpg";
import sweaterImg from "@/assets/product-sweater.jpg";
import coastersImg from "@/assets/product-coasters.jpg";
import hatImg from "@/assets/product-hat.jpg";
import blanketImg from "@/assets/product-blanket.jpg";
import basicsImg from "@/assets/tutorial-basics.jpg";
import grannyImg from "@/assets/tutorial-granny.jpg";
import amigurumiImg from "@/assets/tutorial-amigurumi.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: "Bags" | "Plushies" | "Clothing" | "Home Décor" | "Accessories";
  image: string;
  description: string;
  stock: number;
  rating: number;
};

export const products: Product[] = [
  {
    id: "cream-tote",
    name: "Cream Cotton Tote",
    price: 1499,
    category: "Bags",
    image: bagImg,
    stock: 8,
    rating: 4.9,
    description:
      "A roomy hand-crocheted tote made from soft cotton yarn. Perfect for market runs or as an everyday carry.",
  },
  {
    id: "lavender-bunny",
    name: "Lavender Bunny Plushie",
    price: 1299,
    category: "Plushies",
    image: bunnyImg,
    stock: 12,
    rating: 5.0,
    description:
      "A tiny amigurumi bunny stitched with love. Hypoallergenic filling, safe for little ones.",
  },
  {
    id: "cozy-sweater",
    name: "Cozy Cream Sweater",
    price: 2999,
    category: "Clothing",
    image: sweaterImg,
    stock: 4,
    rating: 4.8,
    description: "Chunky ribbed sweater made from merino blend yarn. Fits like your favourite hug.",
  },
  {
    id: "flower-coasters",
    name: "Pink Flower Coasters (Set of 4)",
    price: 1099,
    category: "Home Décor",
    image: coastersImg,
    stock: 20,
    rating: 4.7,
    description: "Bloom-shaped coasters in soft pink cotton. A tiny garden for your mugs.",
  },
  {
    id: "bucket-hat",
    name: "Sand Bucket Hat",
    price: 1199,
    category: "Accessories",
    image: hatImg,
    stock: 6,
    rating: 4.6,
    description:
      "Breathable summer bucket hat, brimmed just right. Made from natural jute-cotton blend.",
  },
  {
    id: "throw-blanket",
    name: "Waffle Throw Blanket",
    price: 2499,
    category: "Home Décor",
    image: blanketImg,
    stock: 3,
    rating: 4.9,
    description: "Open-weave throw perfect for reading nooks. Airy, warm and beautifully draped.",
  },
];

export const categories = [
  "All",
  "Bags",
  "Plushies",
  "Clothing",
  "Home Décor",
  "Accessories",
] as const;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

/* ---------------------------------------------------------------------- */
/*  Tutorials                                                              */
/* ---------------------------------------------------------------------- */

export type Tutorial = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  image: string;
  description: string;
  free: boolean;
  price?: number;
  videoUrl: string;
  /** optional link to a downloadable pattern PDF, shown as a button on the detail page */
  pdfPattern?: string;
  steps: string[];
  materials: string[];
};

// Starter tutorials.
const seedTutorials: Tutorial[] = [
  {
    id: "first-stitches",
    title: "Your First Stitches: Chain & Single Crochet",
    level: "Beginner",
    duration: "12 min",
    image: basicsImg,
    description:
      "Start here! Learn how to hold your hook, make a slip knot, and work your very first rows.",
    free: true,
    videoUrl: "https://www.youtube.com/embed/aAxGTnVNJiE",
    pdfPattern: "",
    materials: ["4mm crochet hook", "Worsted weight cotton yarn", "Scissors"],
    steps: [
      "Make a slip knot and place it on your hook.",
      "Chain 20 stitches at an even tension.",
      "Turn your work and single crochet across the row.",
      "Chain 1, turn, repeat until you have a small swatch.",
    ],
  },
  {
    id: "granny-square",
    title: "The Classic Granny Square",
    level: "Beginner",
    duration: "22 min",
    image: grannyImg,
    description:
      "The building block of blankets, bags and cardigans. Learn the classic granny square in any colour combo.",
    free: true,
    videoUrl: "https://www.youtube.com/embed/GALGQdP_POw",
    pdfPattern: "",
    materials: ["5mm hook", "3 colours of DK yarn", "Tapestry needle"],
    steps: [
      "Make a magic ring and chain 3.",
      "Work 2 dc, ch 2, [3 dc, ch 2] x 3 into the ring.",
      "Join and switch colours for round 2.",
      "Work 3 dc clusters in each corner space.",
    ],
  },
  {
    id: "amigurumi-bear",
    title: "Amigurumi Bear from Scratch",
    level: "Intermediate",
    duration: "48 min",
    image: amigurumiImg,
    description:
      "A full amigurumi walk-through: shaping, invisible decreases, and joining limbs like a pro.",
    free: false,
    price: 9,
    videoUrl: "https://www.youtube.com/embed/xbPB8DGXRBI",
    pdfPattern: "",
    materials: ["3.5mm hook", "Sport weight cotton", "Fibre fill", "Safety eyes"],
    steps: [
      "Crochet the head in continuous spirals.",
      "Shape the body with invisible decreases.",
      "Make 4 limbs and 2 ears.",
      "Stuff firmly and sew everything together.",
    ],
  },
  {
    id: "lace-shawl",
    title: "Delicate Lace Shawl",
    level: "Advanced",
    duration: "1h 20min",
    image: sweaterImg,
    description: "Read charts, work picot edges and block a triangular lace shawl to perfection.",
    free: false,
    price: 14,
    videoUrl: "https://www.youtube.com/embed/B-E8RWO_kpU",
    pdfPattern: "",
    materials: ["3mm hook", "Lace weight merino", "Blocking mats"],
    steps: [
      "Foundation row with chain spaces.",
      "Work shell pattern following the chart.",
      "Add picot edging along the two long sides.",
      "Wet block on foam mats and pin points.",
    ],
  },
];

export const tutorials = seedTutorials;

const STORAGE_KEY = "cozyknots_tutorials_v1";
const DELETED_KEY = "cozyknots_deleted_tutorials_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    return `http://${host}:5000`;
  }
  return "http://localhost:5000";
}

export function resolveMediaUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/")[1];
    return `${getApiBaseUrl()}/uploads/${filename}`;
  }
  return url;
}

export function getDeletedIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function addDeletedId(id: string) {
  if (!isBrowser()) return;
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    window.localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  }
}

export function clearDeletedId(id: string) {
  if (!isBrowser()) return;
  const deleted = getDeletedIds().filter((d) => d !== id);
  window.localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
}

function readStore(): Tutorial[] {
  if (!isBrowser()) return seedTutorials;
  const deletedIds = getDeletedIds();

  let list = seedTutorials;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Tutorial[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTutorials));
  }

  return list
    .filter((t) => !deletedIds.includes(t.id))
    .map((t) => ({
      ...t,
      image: t.image?.startsWith("blob:")
        ? "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=1000&auto=format&fit=crop"
        : resolveMediaUrl(t.image),
      videoUrl: t.videoUrl?.startsWith("blob:")
        ? "https://www.youtube.com/embed/aAxGTnVNJiE"
        : resolveMediaUrl(t.videoUrl),
      pdfPattern: resolveMediaUrl(t.pdfPattern),
    }));
}

function writeStore(list: Tutorial[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** All tutorials, built-in + anything added from /admin. */
export function getAllTutorials(): Tutorial[] {
  return readStore();
}

export function getTutorial(id: string): Tutorial | undefined {
  return readStore().find((t) => t.id === id);
}

/** Adds a new tutorial, or overwrites one with the same id. */
export function addTutorial(tutorial: Tutorial) {
  clearDeletedId(tutorial.id);
  const list = readStore();
  const index = list.findIndex((t) => t.id === tutorial.id);
  if (index >= 0) {
    list[index] = tutorial;
  } else {
    list.push(tutorial);
  }
  writeStore(list);
}

export function removeTutorial(id: string) {
  addDeletedId(id);
  writeStore(readStore().filter((t) => t.id !== id));
}

export function subscribeToTutorialChanges(callback: () => void) {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("cozyknots:tutorials-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("cozyknots:tutorials-changed", handler);
  };
}

export function getVideoEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return url;
  }
  return url;
}

export function openTutorialPdf(tutorial: Tutorial) {
  const url = resolveMediaUrl(tutorial.pdfPattern);
  if (url && url.trim() !== "") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  
  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${tutorial.title} — CozyKnots Pattern PDF</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #2d2d2d; line-height: 1.6; max-width: 800px; margin: 0 auto; }
      h1 { color: #9c4355; border-bottom: 2px solid #e5c5cd; padding-bottom: 10px; font-size: 26px; }
      .meta-box { background: #faf5f6; border: 1px solid #f0d8df; padding: 15px; border-radius: 12px; margin: 20px 0; }
      h2 { color: #6b2e3b; font-size: 18px; margin-top: 25px; }
      ul, ol { padding-left: 24px; }
      li { margin-bottom: 8px; font-size: 14px; }
      .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #888; border-t: 1px solid #eee; padding-top: 15px; }
      @media print {
        body { padding: 0; max-width: 100%; }
      }
    </style>
  </head>
  <body>
    <h1>🧶 CozyKnots — ${tutorial.title}</h1>
    <div class="meta-box">
      <p><strong>Difficulty Level:</strong> ${tutorial.level}</p>
      <p><strong>Estimated Duration:</strong> ${tutorial.duration}</p>
      <p><strong>Description:</strong> ${tutorial.description}</p>
    </div>
    <h2>Materials Needed</h2>
    <ul>
      ${tutorial.materials.map((m) => `<li>${m}</li>`).join("")}
    </ul>
    <h2>Step-by-Step Instructions</h2>
    <ol>
      ${tutorial.steps.map((s) => `<li>${s}</li>`).join("")}
    </ol>
    <div class="footer">
      <p>© CozyKnots Crochet Learning Hub — Happy Crafting!</p>
    </div>
    <script>
      window.onload = function() { window.print(); };
    </script>
  </body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}
