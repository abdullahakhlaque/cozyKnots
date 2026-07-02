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
    price: 42,
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
    price: 28,
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
    price: 128,
    category: "Clothing",
    image: sweaterImg,
    stock: 4,
    rating: 4.8,
    description:
      "Chunky ribbed sweater made from merino blend yarn. Fits like your favourite hug.",
  },
  {
    id: "flower-coasters",
    name: "Pink Flower Coasters (Set of 4)",
    price: 18,
    category: "Home Décor",
    image: coastersImg,
    stock: 20,
    rating: 4.7,
    description:
      "Bloom-shaped coasters in soft pink cotton. A tiny garden for your mugs.",
  },
  {
    id: "bucket-hat",
    name: "Sand Bucket Hat",
    price: 34,
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
    price: 96,
    category: "Home Décor",
    image: blanketImg,
    stock: 3,
    rating: 4.9,
    description:
      "Open-weave throw perfect for reading nooks. Airy, warm and beautifully draped.",
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
  steps: string[];
  materials: string[];
};

export const tutorials: Tutorial[] = [
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
    videoUrl: "https://www.youtube.com/embed/dHqjTKq-6nU",
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
    videoUrl: "https://www.youtube.com/embed/dHqjTKq-6nU",
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
    description:
      "Read charts, work picot edges and block a triangular lace shawl to perfection.",
    free: false,
    price: 14,
    videoUrl: "https://www.youtube.com/embed/aAxGTnVNJiE",
    materials: ["3mm hook", "Lace weight merino", "Blocking mats"],
    steps: [
      "Foundation row with chain spaces.",
      "Work shell pattern following the chart.",
      "Add picot edging along the two long sides.",
      "Wet block on foam mats and pin points.",
    ],
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
export function getTutorial(id: string) {
  return tutorials.find((t) => t.id === id);
}
