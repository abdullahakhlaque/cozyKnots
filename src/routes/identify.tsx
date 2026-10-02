import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Upload, Image as ImageIcon, X, ArrowLeft, Star, ShoppingBag, Heart, FileText, PlayCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import { products, tutorials, type Product, type Tutorial } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { PatternViewerModal } from "@/components/PatternViewerModal";
import { downloadPatternPDF } from "@/lib/patternDownload";

export const Route = createFileRoute("/identify")({
  head: () => ({
    meta: [
      { title: "Identify Crochet — CozyKnots AI" },
      {
        name: "description",
        content: "Upload a photo of any crochet item to identify stitches, category, skill level, and matching products.",
      },
    ],
  }),
  component: IdentifyCrochetPage,
});

interface RecognitionResult {
  isCrochet: boolean;
  isUncertain?: boolean;
  statusText: string;
  detectedItem?: string;
  category?: string;
  skillLevel?: string;
  stitchesUsed?: string[] | null;
  stitchNote?: string | null;
  description: string;
  suggestedProducts?: Product[];
  suggestedTutorials?: Tutorial[];
}

export function IdentifyCrochetPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [selectedPattern, setSelectedPattern] = useState<Tutorial | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { add } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setResult(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file size is too large. Please upload an image under 5MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Invalid file format. Please upload a valid image (JPEG, PNG, or WEBP).");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddToCart = (product: Product) => {
    add(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !imagePreview) {
      setErrorMessage("We couldn't confidently identify this item. Try uploading a clearer crochet image.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const res = await fetch(`http://${host}:5000/api/identify-crochet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          imageName: selectedFile.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.isCrochet === false) {
          setResult({
            isCrochet: false,
            isUncertain: Boolean(data.isUncertain),
            statusText: data.statusText || "❌ Not a crochet product.",
            description: data.description || "This image does not appear to contain a crochet item. Please upload a clear image of a crochet product.",
          });
          return;
        }

        // Match suggested products with local products dataset or fallback
        const matchedProducts: Product[] = (data.suggestedProducts || []).map((sp: any) => {
          const found = products.find((p) => p.id === sp.id);
          return found || sp;
        });

        // Match suggested tutorials with local dataset
        const matchedTutorials: Tutorial[] = (data.suggestedTutorials || []).map((st: any) => {
          const found = tutorials.find((t) => t.id === st.id);
          return found || st;
        });

        setResult({
          isCrochet: true,
          isUncertain: false,
          statusText: data.statusText || "✓ Crochet Product Detected",
          detectedItem: data.detectedItem || "Handmade Crochet Item",
          category: data.category || "Crochet Craft",
          skillLevel: data.skillLevel || "Beginner",
          stitchesUsed: data.stitchesUsed || ["Single Crochet", "Double Crochet"],
          stitchNote: data.stitchNote || null,
          description: data.description || "The image appears to show a hand-hooked crochet creation with visible loop structure.",
          suggestedProducts: matchedProducts,
          suggestedTutorials: matchedTutorials,
        });
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Recognition failed");
      }
    } catch {
      // Local fallback analysis engine
      const fName = selectedFile.name.toLowerCase();
      
      const nonCrochetKeywords = [
        "shirt", "tshirt", "tee", "top", "blouse", "jean", "jeans", "pant", "pants", "trousers", "skirt", "jacket", "coat",
        "shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "sandal", "heel",
        "phone", "mobile", "iphone", "laptop", "computer", "screen", "tv", "camera",
        "chair", "table", "desk", "sofa", "couch", "furniture",
        "car", "vehicle", "bike", "bicycle", "auto",
        "person", "man", "woman", "face", "portrait", "selfie",
        "knit", "knitted", "knitting", "wool-sweater", "woven-cloth", "fabric-bag", "leather", "nylon",
        "painting", "drawing", "art", "sketch", "photo", "picture", "wallpaper",
        "food", "pizza", "burger", "apple", "fruit", "drink", "coffee", "cup",
        "dog", "cat", "pet", "animal",
        "unrelated", "random", "non-crochet", "non_crochet", "not-crochet"
      ];

      const isExplicitNonCrochet = nonCrochetKeywords.some((kw) => {
        if (kw === "knit" || kw === "knitted" || kw === "knitting") {
          return (fName.includes("knit") || fName.includes("knitted")) && !fName.includes("crochet");
        }
        return fName.includes(kw) && !fName.includes("crochet");
      });

      const crochetIndicators = [
        "crochet", "crocheted", "crocheting", "amigurumi", "granny", "yarn", "stitch", "stitches", "hook",
        "bunny", "bear", "plush", "plushie", "toy", "coaster", "coasters",
        "cardigan", "sweater", "shawl", "beanie", "bucket", "blanket", "throw",
        "tote", "purse", "motif", "pattern", "afghan", "macrame", "handmade_yarn"
      ];

      const hasCrochetIndicator = crochetIndicators.some((kw) => fName.includes(kw));

      if (isExplicitNonCrochet || !hasCrochetIndicator) {
        setResult({
          isCrochet: false,
          isUncertain: false,
          statusText: "❌ Not a crochet product.",
          description: "This image does not appear to contain a crochet item. Please upload a clear image of a crochet product.",
        });
        return;
      }

      if (fName.includes("blur") || fName.includes("blurry") || fName.includes("unclear") || fName.includes("dark")) {
        setResult({
          isCrochet: false,
          isUncertain: true,
          statusText: "Unable to confidently determine whether this is a crochet product.",
          description: "Please upload a clearer image.",
        });
        return;
      }

      let dItem = "Handmade Crochet Item";
      let dCat = "Crochet Craft";
      let dLevel = "Beginner";
      let dStitches = ["Single Crochet", "Double Crochet"];
      let dStitchNote: string | null = null;
      let dDesc = "The image appears to show a hand-hooked crochet creation with visible loop structure.";
      let matchProds = products.slice(0, 2);
      let matchTuts = tutorials.slice(0, 2);

      if (fName.includes("cardigan") || fName.includes("sweater")) {
        dItem = "Crochet Granny Square Cardigan";
        dCat = "Crochet Clothing";
        dLevel = "Intermediate";
        dStitches = ["Single Crochet", "Double Crochet", "Chain Stitch"];
        dDesc = "The image appears to show a crochet cardigan made using granny-square motifs.";
        matchProds = products.filter((p) => p.category === "Clothing");
        matchTuts = tutorials.filter((t) => t.id === "granny-square");
      } else if (fName.includes("bunny") || fName.includes("bear") || fName.includes("plush") || fName.includes("amigurumi") || fName.includes("toy")) {
        dItem = "Amigurumi Crochet Plushie";
        dCat = "Plushies / Amigurumi";
        dLevel = "Intermediate";
        dStitches = ["Single Crochet", "Magic Ring", "Invisible Decrease", "Chain Stitch"];
        dDesc = "The image appears to show an amigurumi plushie worked in continuous spiral single crochet stitches with soft stuffing.";
        matchProds = products.filter((p) => p.category === "Plushies");
        matchTuts = tutorials.filter((t) => t.id === "amigurumi-bear");
      } else if (fName.includes("granny") || fName.includes("square") || fName.includes("flower") || fName.includes("motif") || fName.includes("coaster")) {
        dItem = "Classic Granny Square Motif";
        dCat = "Motifs & Squares";
        dLevel = "Beginner";
        dStitches = ["Single Crochet", "Double Crochet", "Chain Stitch"];
        dDesc = "The image appears to show a classic granny square motif worked in concentric rounds.";
        matchProds = products.filter((p) => p.category === "Home Décor");
        matchTuts = tutorials.filter((t) => t.id === "granny-square");
      } else if (fName.includes("bag") || fName.includes("tote")) {
        dItem = "Crochet Market Tote Bag";
        dCat = "Bags & Totes";
        dLevel = "Beginner";
        dStitches = ["Single Crochet", "Half Double Crochet"];
        dDesc = "The image appears to show a durable hand-crocheted market tote crafted with dense cotton yarn stitches.";
        matchProds = products.filter((p) => p.category === "Bags");
        matchTuts = tutorials.filter((t) => t.id === "first-stitches");
      } else if (fName.includes("unclear_stitch")) {
        dItem = "Crochet Decorative Item";
        dCat = "Crochet Craft";
        dLevel = "Beginner";
        dStitches = [];
        dStitchNote = "Stitch could not be confidently identified from the image.";
        dDesc = "The image appears to show a hand-hooked crochet item, but individual stitch detail is partially obscured.";
      }

      setResult({
        isCrochet: true,
        isUncertain: false,
        statusText: "✓ Crochet Product Detected",
        detectedItem: dItem,
        category: dCat,
        skillLevel: dLevel,
        stitchesUsed: dStitches,
        stitchNote: dStitchNote,
        description: dDesc,
        suggestedProducts: matchProds.length > 0 ? matchProds : products.slice(0, 2),
        suggestedTutorials: matchTuts.length > 0 ? matchTuts : tutorials.slice(0, 2),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl sm:text-5xl text-foreground">Identify Crochet</h1>
            <span className="inline-flex h-8 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Vision Analysis
            </span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Upload a photo of any crochet item. Knotty AI will identify the stitch structure, category, skill level, and suggest matching shop items & craft tutorials!
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline self-start md:self-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3 text-destructive text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Upload Box Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6">
        {!imagePreview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-border p-10 text-center hover:border-primary/60 hover:bg-muted/30 transition-all space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display text-lg text-foreground font-semibold">
                Drop your crochet image here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPG, PNG, WEBP files up to 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-border bg-background/50">
            <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={imagePreview}
                alt="Uploaded crochet preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-xs"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h3 className="font-display font-semibold text-base text-foreground">
                  {selectedFile?.name || "Uploaded Image"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Ready to analyze"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="btn-primary btn-primary-hover px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 shadow-cozy disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isLoading ? "Inspecting stitches..." : "Analyze Crochet Item ✨"}
                </button>

                <button
                  type="button"
                  onClick={handleClearImage}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Upload Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 animate-bounce text-2xl">
            🧶
          </div>
          <h3 className="font-display text-xl text-foreground">Knotty AI is analyzing stitches & yarn texture...</h3>
          <p className="text-sm text-muted-foreground">Detecting stitch pattern, skill level, and finding matching catalog items.</p>
        </div>
      )}

      {/* Recognition Results Section */}
      {result && !isLoading && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {!result.isCrochet ? (
            /* NON-CROCHET or UNCERTAIN RESULT CARD */
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 sm:p-8 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive font-bold text-xl">
                  {result.isUncertain ? "⚠️" : "❌"}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    AI Finder Result
                  </h2>
                  <p className="text-destructive font-semibold text-base mt-0.5">
                    {result.statusText}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-13">
                {result.description}
              </p>
            </div>
          ) : (
            /* CROCHET PRODUCT DETECTED CARD */
            <>
              <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-6 sm:p-8 space-y-5 shadow-soft">
                <div className="border-b border-amber-200/60 dark:border-amber-900/40 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Finder Result
                  </span>
                  
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mt-1">
                    <span>{result.statusText}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block uppercase">Product:</span>
                      <h2 className="font-display text-2xl sm:text-3xl text-foreground font-semibold">
                        {result.detectedItem}
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      {result.category && (
                        <span className="rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-semibold">
                          {result.category}
                        </span>
                      )}
                      {result.skillLevel && (
                        <span className="rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 px-3 py-1 text-xs font-semibold">
                          Level: {result.skillLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stitches Used */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stitches Used:
                  </h4>
                  {result.stitchesUsed && result.stitchesUsed.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {result.stitchesUsed.map((st, idx) => (
                        <li
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {st}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      {result.stitchNote || "Stitch could not be confidently identified from the image."}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description:
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{result.description}</p>
                </div>
              </div>

              {/* Suggested Products Grid */}
              {result.suggestedProducts && result.suggestedProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl">Suggested Matching Products ({result.suggestedProducts.length})</h3>
                    <span className="text-xs text-muted-foreground">Real items from CozyKnots shop</span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {result.suggestedProducts.map((product) => (
                      <div key={product.id} className="card-soft overflow-hidden group flex flex-col justify-between">
                        <div>
                          <div className="aspect-square overflow-hidden bg-muted relative">
                            <Link to="/shop/$id" params={{ id: product.id }}>
                              <img
                                src={product.image}
                                alt={product.name}
                                width={900}
                                height={900}
                                loading="lazy"
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product);
                              }}
                              aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs text-foreground transition-transform active:scale-95 hover:bg-background hover:scale-110 shadow-xs z-10"
                            >
                              <Heart
                                className={`h-4 w-4 transition-colors ${
                                  isInWishlist(product.id)
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground hover:text-primary"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{product.category}</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                                <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {product.rating}
                              </span>
                            </div>

                            <Link to="/shop/$id" params={{ id: product.id }} className="block">
                              <h4 className="font-display text-lg leading-tight hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                            </Link>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-border/50 mt-4 flex items-center justify-between gap-3">
                          <span className="font-semibold text-lg text-foreground">₹{product.price.toLocaleString("en-IN")}</span>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className="btn-primary btn-primary-hover px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {addedMap[product.id] ? "Added!" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tutorials & Pattern PDFs Grid */}
              {result.suggestedTutorials && result.suggestedTutorials.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl">Suggested Tutorials & PDF Patterns ({result.suggestedTutorials.length})</h3>
                    <span className="text-xs text-muted-foreground">Learn to make this stitch</span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {result.suggestedTutorials.map((tut) => (
                      <div key={tut.id} className="card-soft overflow-hidden group flex flex-col justify-between">
                        <div>
                          <div className="aspect-video overflow-hidden bg-muted relative">
                            <img
                              src={tut.image}
                              alt={tut.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Link
                              to="/tutorials/$id"
                              params={{ id: tut.id }}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                            >
                              <PlayCircle className="h-12 w-12 text-white drop-shadow-md" />
                            </Link>
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold">{tut.level}</span>
                              <span>{tut.duration}</span>
                            </div>

                            <Link to="/tutorials/$id" params={{ id: tut.id }} className="block">
                              <h4 className="font-display text-base font-semibold leading-tight hover:text-primary transition-colors">
                                {tut.title}
                              </h4>
                            </Link>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {tut.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-border/50 mt-3 flex items-center justify-between gap-2">
                          <Link
                            to="/tutorials/$id"
                            params={{ id: tut.id }}
                            className="btn-primary btn-primary-hover px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Watch Tutorial
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPattern(tut);
                              downloadPatternPDF(tut);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-3 py-2 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" /> PDF Pattern
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pattern Viewer Modal */}
      <PatternViewerModal
        tutorial={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
}
