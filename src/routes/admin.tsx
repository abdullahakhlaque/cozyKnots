import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Loader2,
  X,
  Play,
  Package,
  ShoppingBag,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getAllTutorials,
  addTutorial,
  removeTutorial as removeLocalTutorial,
  getDeletedIds,
  type Tutorial,
} from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

interface Material {
  id: string;
  value: string;
}

interface Step {
  id: string;
  value: string;
}

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  orderId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status?: string;
  createdAt: string;
}

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tutorials" | "orders">("tutorials");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [title, setTitle] = useState("");
  const [editingTutorialId, setEditingTutorialId] = useState<string | null>(null);
  const [level, setLevel] = useState<Tutorial["level"]>("Beginner");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");

  // Media Input (File or URL)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  const [materials, setMaterials] = useState<Material[]>([
    { id: "1", value: "4mm crochet hook" },
    { id: "2", value: "Cotton yarn swatch" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", value: "Make a slip knot and chain 20 stitches" },
    { id: "2", value: "Work single crochet across each row" },
  ]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user && user.role === "admin") {
      fetchTutorials();
      fetchOrders();
    }
  }, [user, mounted]);

  const fetchTutorials = async () => {
    const deleted = getDeletedIds();
    const local = getAllTutorials();
    const localTutorials = Array.isArray(local) ? local : [];
    try {
      const res = await fetch("http://localhost:5000/api/tutorials");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // A fresh backend can have fewer records than the browser store.
          // Keep both, with the admin's latest local edit taking precedence.
          const merged = new Map<string, Tutorial>();
          data.forEach((tutorial: Tutorial) => merged.set(tutorial.id, tutorial));
          localTutorials.forEach((tutorial) => merged.set(tutorial.id, tutorial));
          setTutorials([...merged.values()].filter((t) => !deleted.includes(t.id)));
          return;
        }
      }
    } catch (err) {
      console.log("Backend offline, using local data store");
    }
    setTutorials(localTutorials.filter((t) => !deleted.includes(t.id)));
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          return;
        }
      }
    } catch (err) {
      console.log("Backend offline, using sample orders");
    }
    setOrders([
      {
        orderId: "ORD-1001",
        userName: "Nashra Admin",
        userEmail: "admin@gmail.com",
        items: [{ name: "Cream Cotton Tote", price: 42, qty: 1 }],
        total: 42,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
      {
        orderId: "ORD-1002",
        userName: "Sarah Jenkins",
        userEmail: "sarah@example.com",
        items: [{ name: "Lavender Bunny Plushie", price: 28, qty: 2 }],
        total: 56,
        status: "pending",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!duration.trim()) newErrors.duration = "Duration is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!videoFile && !videoUrlInput.trim()) {
      newErrors.video = "Please upload a video file or enter a YouTube video URL";
    }
    if (!isFree && !price) newErrors.price = "Price is required for paid tutorials";
    if (!isFree && parseFloat(price) <= 0) newErrors.price = "Price must be greater than 0";

    const filledMaterials = materials.filter((m) => m.value.trim());
    if (filledMaterials.length === 0) newErrors.materials = "Add at least one material";

    const filledSteps = steps.filter((s) => s.value.trim());
    if (filledSteps.length === 0) newErrors.steps = "Add at least one step";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
      setErrors((prev) => ({ ...prev, video: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setImageError(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageUrlInput(val);
    setImageError(false);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now().toString(), value: "" }]);
  };

  const removeMaterialItem = (id: string) => {
    if (materials.length <= 1) return;
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const updateMaterial = (id: string, value: string) => {
    setMaterials(materials.map((m) => (m.id === id ? { ...m, value } : m)));
    if (value.trim()) setErrors((prev) => ({ ...prev, materials: "" }));
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), value: "" }]);
  };

  const removeStepItem = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, value: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, value } : s)));
    if (value.trim()) setErrors((prev) => ({ ...prev, steps: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix errors before publishing.");
      return;
    }

    setIsUploading(true);

    const filledMaterials = materials.filter((m) => m.value.trim()).map((m) => m.value);
    const filledSteps = steps.filter((s) => s.value.trim()).map((s) => s.value);
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const id = editingTutorialId || slug || `tutorial-${Date.now()}`;

    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

    let finalVideoUrl = videoUrlInput.trim() || "https://www.youtube.com/embed/aAxGTnVNJiE";
    let finalImageUrl =
      imageUrlInput.trim() ||
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=1000&auto=format&fit=crop";
    let finalPdfUrl = pdfUrlInput.trim();

    if (imageFile) {
      try {
        finalImageUrl = await fileToBase64(imageFile);
      } catch {}
    }
    if (pdfFile) {
      try {
        finalPdfUrl = await fileToBase64(pdfFile);
      } catch {}
    }

    if (videoFile || imageFile || pdfFile) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("level", level);
      formData.append("duration", duration);
      formData.append("description", description);
      formData.append("free", String(isFree));
      formData.append("price", price || "0");
      if (videoFile) formData.append("video", videoFile);
      if (imageFile) formData.append("image", imageFile);
      if (pdfFile) formData.append("pdf", pdfFile);
      formData.append("materials", JSON.stringify(filledMaterials));
      formData.append("steps", JSON.stringify(filledSteps));

      try {
        const res = await fetch("http://localhost:5000/api/tutorials", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.image) finalImageUrl = resData.image;
          if (resData.videoUrl) finalVideoUrl = resData.videoUrl;
          if (resData.pdfPattern) finalPdfUrl = resData.pdfPattern;
        }
      } catch (err) {
        console.log("Backend offline during file upload, using persistent local save");
      }
    }

    // Save to local store for immediate UI update & offline reliability
    const newTutorial: Tutorial = {
      id,
      title: title.trim(),
      level,
      duration: duration.trim(),
      description: description.trim(),
      free: isFree,
      price: isFree ? undefined : parseFloat(price) || 8,
      videoUrl: finalVideoUrl,
      image: finalImageUrl,
      pdfPattern: finalPdfUrl || undefined,
      materials: filledMaterials,
      steps: filledSteps,
    };

    addTutorial(newTutorial);
    fetchTutorials();

    toast.success(
      editingTutorialId ? "Tutorial updated successfully!" : "✨ Tutorial & PDF Pattern published successfully!",
    );

    setEditingTutorialId(null);
    setTitle("");
    setDuration("");
    setDescription("");
    setVideoFile(null);
    setVideoUrlInput("");
    setVideoPreview("");
    setImageFile(null);
    setImageUrlInput("");
    setImagePreview("");
    setPdfFile(null);
    setPdfUrlInput("");
    setPdfFileName("");
    setPrice("");
    setMaterials([
      { id: "1", value: "" },
      { id: "2", value: "" },
    ]);
    setSteps([
      { id: "1", value: "" },
      { id: "2", value: "" },
    ]);
    setErrors({});
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tutorial?")) return;
    try {
      await fetch(`http://localhost:5000/api/tutorials/${id}`, { method: "DELETE" });
    } catch {
      // The local store is still updated when the API is unavailable.
    }
    removeLocalTutorial(id);
    fetchTutorials();
    toast.success("Tutorial deleted");
  };

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorialId(tutorial.id);
    setTitle(tutorial.title);
    setLevel(tutorial.level);
    setDuration(tutorial.duration);
    setDescription(tutorial.description);
    setIsFree(tutorial.free);
    setPrice(tutorial.price?.toString() || "");
    setVideoFile(null);
    setVideoUrlInput(tutorial.videoUrl);
    setVideoPreview("");
    setImageFile(null);
    setImageUrlInput(tutorial.image);
    setImagePreview(tutorial.image);
    setImageError(false);
    setPdfFile(null);
    setPdfUrlInput(tutorial.pdfPattern || "");
    setPdfFileName("");
    setMaterials(
      (tutorial.materials.length ? tutorial.materials : [""]).map((value, index) => ({
        id: `material-${Date.now()}-${index}`,
        value,
      })),
    );
    setSteps(
      (tutorial.steps.length ? tutorial.steps : [""]).map((value, index) => ({
        id: `step-${Date.now()}-${index}`,
        value,
      })),
    );
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="space-y-4 max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-2xl text-primary">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground">
            Please log in with admin credentials (<strong>admin@gmail.com</strong>) to access the
            admin control panel.
          </p>
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="btn-primary btn-primary-hover w-full"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/60 via-background to-lavender/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-primary">Admin Control Hub</h1>
            <p className="text-muted-foreground mt-1">
              Manage tutorials, videos, PDF patterns & customer CRM orders
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab("tutorials")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "tutorials"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Video className="h-4 w-4" /> Tutorials & PDFs
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Package className="h-4 w-4" /> CRM Orders ({orders.length})
            </button>
          </div>
        </div>

        {activeTab === "tutorials" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border bg-card shadow-soft p-6 sm:p-8 sticky top-6">
                <h2 className="text-2xl font-display text-primary mb-6 flex items-center gap-2">
                  <Plus className="h-6 w-6 text-primary" />
                  Add New Tutorial & Pattern PDF
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Tutorial Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (e.target.value.trim()) setErrors((prev) => ({ ...prev, title: "" }));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.title
                          ? "border-destructive bg-destructive/5"
                          : "border-border bg-background"
                      }`}
                      placeholder="e.g. Daisy Chain Bracelet"
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Difficulty *
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as Tutorial["level"])}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Duration *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 min"
                        value={duration}
                        onChange={(e) => {
                          setDuration(e.target.value);
                          if (e.target.value.trim())
                            setErrors((prev) => ({ ...prev, duration: "" }));
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                          errors.duration
                            ? "border-destructive bg-destructive/5"
                            : "border-border bg-background"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (e.target.value.trim())
                          setErrors((prev) => ({ ...prev, description: "" }));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.description
                          ? "border-destructive bg-destructive/5"
                          : "border-border bg-background"
                      }`}
                      rows={3}
                      placeholder="Describe the stitches and project details..."
                    />
                  </div>

                  <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border/60">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <span className="font-semibold text-sm">Free Tutorial</span>
                    </label>
                    {!isFree && (
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="8.00"
                          value={price}
                          onChange={(e) => {
                            setPrice(e.target.value);
                            if (e.target.value) setErrors((prev) => ({ ...prev, price: "" }));
                          }}
                          className="w-full px-4 py-2 rounded-xl border border-border bg-background text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Video className="inline h-4 w-4 mr-1 text-primary" />
                      Video File Upload or Embed Link *
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:font-semibold cursor-pointer"
                    />
                    <div className="text-center text-xs text-muted-foreground font-medium my-1">
                      — OR —
                    </div>
                    <input
                      type="url"
                      placeholder="Paste YouTube / Video URL"
                      value={videoUrlInput}
                      onChange={(e) => {
                        setVideoUrlInput(e.target.value);
                        if (e.target.value.trim()) setErrors((prev) => ({ ...prev, video: "" }));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
                    />
                    {errors.video && (
                      <p className="text-xs text-destructive mt-1">{errors.video}</p>
                    )}
                    {videoPreview && (
                      <video
                        src={videoPreview}
                        controls
                        className="w-full max-h-32 rounded-xl mt-2 object-cover"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <FileText className="inline h-4 w-4 mr-1 text-primary" />
                      Pattern PDF File Uploader
                    </label>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfChange}
                      className="w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:px-3 file:py-1.5 file:font-semibold cursor-pointer"
                    />
                    <input
                      type="url"
                      placeholder="Or paste Pattern PDF link URL"
                      value={pdfUrlInput}
                      onChange={(e) => setPdfUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
                    />
                    {pdfFileName && (
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                        <FileText className="h-3.5 w-3.5" /> PDF attached: {pdfFileName}
                      </p>
                    )}
                  </div>

                  {/* Image Thumbnail Upload / URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <ImageIcon className="inline h-4 w-4 mr-1 text-primary" />
                      Thumbnail Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-secondary file:text-secondary-foreground file:px-3 file:py-1.5 file:font-semibold cursor-pointer"
                    />
                    <input
                      type="url"
                      placeholder="Or paste thumbnail image URL (e.g. https://images.unsplash.com/...)"
                      value={imageUrlInput}
                      onChange={handleImageUrlChange}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    {/* Live Image Preview & Graceful Fallback Container */}
                    <div className="mt-2">
                      <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Live Image Preview:
                      </span>
                      {imagePreview || imageUrlInput.trim() ? (
                        imageError ? (
                          <div className="w-full h-32 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col items-center justify-center p-3 text-center">
                            <AlertCircle className="h-6 w-6 text-amber-600 mb-1" />
                            <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                              Invalid or Broken Image URL
                            </span>
                            <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                              Please check the URL or upload a file
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-border bg-muted/20 shadow-sm group">
                            <img
                              src={imagePreview || imageUrlInput.trim()}
                              alt="Thumbnail live preview"
                              onError={() => setImageError(true)}
                              onLoad={() => setImageError(false)}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              Live Preview
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-28 rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-center p-3">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1" />
                          <span className="text-xs font-medium text-muted-foreground">
                            No thumbnail selected
                          </span>
                          <span className="text-[11px] text-muted-foreground/70 mt-0.5">
                            Enter an image URL or choose a file to preview
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full mt-4 btn-primary btn-primary-hover py-3 font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        {editingTutorialId ? (
                          <><Pencil className="h-4 w-4" /> Save Tutorial Changes</>
                        ) : (
                          <><Plus className="h-4 w-4" /> Publish Tutorial & PDF Pattern</>
                        )}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-display text-primary mb-3">Materials Needed</h3>
                <div className="space-y-2">
                  {materials.map((m) => (
                    <div key={m.id} className="flex gap-2">
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => updateMaterial(m.id, e.target.value)}
                        placeholder="e.g. 5mm crochet hook"
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                      {materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterialItem(m.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="mt-3 w-full py-2 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  + Add Material Item
                </button>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-display text-primary mb-3">
                  Step-by-Step Instructions
                </h3>
                <div className="space-y-2">
                  {steps.map((s, idx) => (
                    <div key={s.id} className="flex gap-2 items-center">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={s.value}
                        onChange={(e) => updateStep(s.id, e.target.value)}
                        placeholder="Describe step instruction..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStepItem(s.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-3 w-full py-2 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  + Add Step Instruction
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-display text-primary mb-4">
                  Published Tutorials ({tutorials.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tutorials.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-muted">
                        <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-semibold">
                          {t.level}
                        </span>
                        <span className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-semibold">
                          {t.free ? "Free" : `$${t.price}`}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-medium text-base line-clamp-1">
                            {t.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {t.description}
                          </p>
                          {t.pdfPattern && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <FileText className="h-3 w-3" /> PDF Included
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/60">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.duration}
                          </span>
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                            title="Edit tutorial"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                            title="Delete Tutorial"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display text-primary">Customer Orders CRM</h2>
              <button
                onClick={fetchOrders}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Orders
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No orders recorded yet. Place an order on checkout to see it appear here!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items Purchased</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((o) => (
                        <tr
                          key={o.orderId || o._id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-xs text-primary">
                            {o.orderId}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">{o.userName || "Customer"}</div>
                            <div className="text-xs text-muted-foreground">{o.userEmail}</div>
                          </td>
                          <td className="p-4">
                            <ul className="space-y-1 text-xs">
                              {o.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.name} <span className="font-semibold">x{item.qty}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-4 font-bold font-mono">
                            ${Number(o.total || 0).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 px-3 py-1 text-xs font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> {o.status || "Completed"}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(o.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
