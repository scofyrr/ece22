import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { Coins, Upload, X, ShieldCheck } from "lucide-react";
import {
  BOOK_FILE_ACCEPT,
  UPLOAD_FEE,
  MAX_COVER_MB,
  validateBookFile,
} from "@/lib/book-upload.constants";
import { moderateBookServer } from "@/lib/moderation.functions";

const schema = z.object({
  title: z.string().trim().min(2, "Título muy corto").max(200),
  author: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
});

type Props = {
  asDialog?: boolean;
  open?: boolean;
  onClose?: () => void;
  initialFile?: File | null;
};

function titleFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base.slice(0, 200) || "Sin título";
}

export function BookUploadForm({ asDialog, open = true, onClose, initialFile = null }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const moderate = useServerFn(moderateBookServer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialFile ? titleFromFilename(initialFile.name) : "");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(initialFile);
  const [cover, setCover] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading-cover" | "moderating" | "uploading" | "saving">("idle");

  const pickFile = () => fileInputRef.current?.click();

  const onFilePicked = (f: File | null) => {
    if (!f) return;
    const check = validateBookFile(f);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setFile(f);
    if (!title.trim()) setTitle(titleFromFilename(f.name));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error("Inicia sesión para subir libros");
      return;
    }
    if ((profile.points ?? 0) < UPLOAD_FEE) {
      toast.error(`Necesitas ${UPLOAD_FEE} puntos (tienes ${profile.points ?? 0})`);
      return;
    }
    if (!file) {
      toast.error("Selecciona un archivo");
      pickFile();
      return;
    }
    const check = validateBookFile(file);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    if (cover && !cover.type.startsWith("image/")) {
      toast.error("La portada debe ser una imagen");
      return;
    }
    if (cover && cover.size > MAX_COVER_MB * 1024 * 1024) {
      toast.error(`La portada supera ${MAX_COVER_MB} MB`);
      return;
    }

    const parsed = schema.safeParse({ title, author, description });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    setSubmitting(true);
    let filePath: string | null = null;
    let coverPath: string | null = null;

    try {
      // 1) Sube portada primero (si hay) para poder analizarla con IA
      let coverUrl: string | null = null;
      if (cover) {
        setStage("uploading-cover");
        const cext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
        coverPath = `${user.id}/${crypto.randomUUID()}.${cext}`;
        const { error: cErr } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, cover, { contentType: cover.type });
        if (cErr) throw cErr;
        coverUrl = supabase.storage.from("book-covers").getPublicUrl(coverPath).data.publicUrl;
      }

      // 2) Moderación IA de metadatos + portada
      setStage("moderating");
      const verdict = await moderate({ data: {
        title: parsed.data.title,
        author: parsed.data.author || "",
        description: parsed.data.description || "",
        coverUrl: coverUrl || "",
      }});
      if (!verdict.allowed) {
        if (coverPath) await supabase.storage.from("book-covers").remove([coverPath]);
        toast.error(verdict.message);
        return;
      }

      // 3) Sube el archivo
      setStage("uploading");
      filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("book-pdfs")
        .upload(filePath, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      // 4) Registra el libro (cobra puntos)
      setStage("saving");
      const { error } = await supabase.rpc("create_book", {
        _title: parsed.data.title,
        _author: parsed.data.author || "",
        _description: parsed.data.description || "",
        _cover_url: coverUrl ?? "",
        _file_path: filePath,
        _mime_type: file.type || "application/octet-stream",
        _file_ext: ext,
        _file_size: file.size,
      });
      if (error) throw error;

      toast.success(`¡Libro publicado! Se descontaron ${UPLOAD_FEE} pts 📚`);
      await refreshProfile();
      onClose?.();
      navigate({ to: "/biblioteca" });
    } catch (err: unknown) {
      if (filePath) await supabase.storage.from("book-pdfs").remove([filePath]);
      if (coverPath) await supabase.storage.from("book-covers").remove([coverPath]);
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(msg.includes("Necesitas") ? msg : `No se pudo publicar: ${msg}`);
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  };

  const input =
    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary";
  const canAfford = (profile?.points ?? 0) >= UPLOAD_FEE;

  const form = (
    <form onSubmit={submit} className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={BOOK_FILE_ACCEPT}
        onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
      />

      <div>
        <label className="mb-1 block text-sm font-bold">Archivo del libro</label>
        <button
          type="button"
          onClick={pickFile}
          className="neo-btn flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink bg-muted/50 px-4 py-6 font-bold hover:bg-muted"
        >
          <Upload className="h-5 w-5" />
          {file ? file.name : "Toca aquí para abrir el explorador de archivos"}
        </button>
        {file && (
          <p className="mt-1 text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB — no ejecutables (.exe, .bat, etc.)
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} maxLength={200} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Autor (opcional)</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} className={input} maxLength={120} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Descripción (opcional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={input} maxLength={2000} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Portada (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className={input} />
      </div>
      <button
        type="submit"
        disabled={submitting || !canAfford || !file}
        className="neo-btn w-full rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50"
      >
        {submitting
          ? stage === "moderating" ? "🛡️ Analizando con IA..."
            : stage === "uploading-cover" ? "Subiendo portada..."
            : stage === "uploading" ? "Subiendo archivo..."
            : stage === "saving" ? "Guardando..."
            : "Subiendo..."
          : canAfford ? `Publicar (-${UPLOAD_FEE} pts)` : `Te faltan ${UPLOAD_FEE - (profile?.points ?? 0)} pts`}
      </button>
      <p className="text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-3 w-3" /> Portada + metadatos serán revisados por IA antes de publicar.</p>
    </form>
  );

  if (asDialog && open) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="neo-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold">Subir libro</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          {profile && (
            <p className="mb-4 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold">
              <Coins className="h-4 w-4" /> {profile.points} pts
            </p>
          )}
          {form}
        </div>
      </div>
    );
  }

  return form;
}
