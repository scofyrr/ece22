import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { moderatePostServer } from "@/lib/moderation.functions";
import { ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/new")({
  head: () => ({ meta: [{ title: "Publicar — ECE" }] }),
  component: NewPostPage,
});

const schema = z.object({
  title: z.string().trim().min(3, "Título muy corto").max(200),
  content: z.string().trim().min(10, "Cuéntanos un poco más").max(20000),
  category_id: z.string().uuid("Elige una categoría"),
  cover_image_url: z.string().url().or(z.literal("")).optional(),
});

type Category = { id: string; name: string; emoji: string };

function NewPostPage() {
  const { user, ban, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const moderate = useServerFn(moderatePostServer);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "moderating" | "publishing">("idle");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    supabase.from("categories").select("id,name,emoji").order("name").then(({ data }) => {
      setCategories((data ?? []) as Category[]);
      if (data && data.length) setCategoryId(data[0].id);
    });
  }, []);

  if (ban) {
    return (
      <div><Navbar />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="neo-card p-8">
            <h1 className="font-display text-3xl font-extrabold text-destructive">Cuenta suspendida</h1>
            <p className="mt-3 text-muted-foreground">Motivo: {ban.reason}</p>
            {ban.until && <p className="mt-1 text-sm">Hasta: {new Date(ban.until).toLocaleString("es")}</p>}
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ title, content, category_id: categoryId, cover_image_url: coverUrl });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSubmitting(true);
    try {
      setStage("moderating");
      const verdict = await moderate({ data: {
        title: parsed.data.title,
        content: parsed.data.content,
        imageUrl: parsed.data.cover_image_url || "",
      }});
      if (!verdict.allowed) {
        toast.error(verdict.message);
        return;
      }
      setStage("publishing");
      const { data, error } = await supabase.from("posts").insert({
        author_id: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        category_id: parsed.data.category_id,
        cover_image_url: parsed.data.cover_image_url || null,
      }).select("id").single();
      if (error) { toast.error(error.message); return; }
      toast.success("¡Publicado! +10 pts 🎉");
      navigate({ to: "/post/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-4xl font-extrabold">Comparte lo que sabes</h1>
        <p className="text-muted-foreground">
          <ShieldCheck className="mr-1 inline h-4 w-4" /> Antes de publicar, la IA revisa que el contenido sea apto para la comunidad escolar.
        </p>

        <form onSubmit={submit} className="neo-card mt-6 space-y-5 p-6">
          <div>
            <label className="mb-1 block text-sm font-bold">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
              placeholder="Ej. Cómo memorizar fórmulas trigonométricas"
              className="w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Imagen de portada (URL opcional)</label>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
            <p className="mt-1 text-xs text-muted-foreground">La IA analizará esta imagen antes de publicar.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Contenido</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} maxLength={20000}
              placeholder="Explica con tus palabras…"
              className="w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{content.length}/20000</p>
          </div>
          <button disabled={submitting}
            className="neo-btn inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {stage === "moderating" ? "Analizando con IA..." : stage === "publishing" ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </main>
    </div>
  );
}
