import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { s as supabase } from "./client-DIhsBbtt.js";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X, Coins } from "lucide-react";
const UPLOAD_FEE = 40;
const MAX_FILE_MB = 25;
const MAX_COVER_MB = 5;
const BLOCKED_EXT = /* @__PURE__ */ new Set([
  "exe",
  "msi",
  "msp",
  "bat",
  "cmd",
  "com",
  "scr",
  "ps1",
  "psm1",
  "vbs",
  "vbe",
  "js",
  "jse",
  "ws",
  "wsf",
  "wsh",
  "jar",
  "apk",
  "app",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "sh",
  "bash",
  "run",
  "dll",
  "sys",
  "drv",
  "reg",
  "inf",
  "cpl",
  "msc",
  "hta",
  "lnk",
  "iso",
  "img",
  "bin",
  "php",
  "asp",
  "aspx",
  "cgi",
]);
function isBlockedExtension(ext) {
  return BLOCKED_EXT.has(ext.toLowerCase());
}
function validateBookFile(file) {
  const parts = file.name.split(".");
  if (parts.length < 2) {
    return {
      ok: false,
      message: "El archivo debe tener extensión (ej. .pdf, .docx)",
    };
  }
  const ext = (parts.pop() || "").toLowerCase();
  if (!ext || ext.length > 10) {
    return { ok: false, message: "Extensión de archivo no válida" };
  }
  if (isBlockedExtension(ext)) {
    return {
      ok: false,
      message: `Formato .${ext} no permitido por seguridad (ejecutables/scripts)`,
    };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, message: `El archivo supera ${MAX_FILE_MB} MB` };
  }
  return { ok: true };
}
const BOOK_FILE_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.epub,.odt,.ods,.xls,.xlsx,.rtf,.csv,.mp3,.mp4,.png,.jpg,.jpeg,.webp";
const schema = z.object({
  title: z.string().trim().min(2, "Título muy corto").max(200),
  author: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2e3).optional(),
});
function titleFromFilename(name) {
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return base.slice(0, 200) || "Sin título";
}
function BookUploadForm({
  asDialog,
  open = true,
  onClose,
  initialFile = null,
}) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState(
    initialFile ? titleFromFilename(initialFile.name) : "",
  );
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(initialFile);
  const [cover, setCover] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const pickFile = () => fileInputRef.current?.click();
  const onFilePicked = (f) => {
    if (!f) return;
    const check = validateBookFile(f);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setFile(f);
    if (!title.trim()) setTitle(titleFromFilename(f.name));
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error("Inicia sesión para subir libros");
      return;
    }
    if ((profile.points ?? 0) < UPLOAD_FEE) {
      toast.error(
        `Necesitas ${UPLOAD_FEE} puntos (tienes ${profile.points ?? 0})`,
      );
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
    let filePath = null;
    let coverPath = null;
    try {
      filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("book-pdfs")
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
        });
      if (upErr) throw upErr;
      let coverUrl = null;
      if (cover) {
        const cext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
        coverPath = `${user.id}/${crypto.randomUUID()}.${cext}`;
        const { error: cErr } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, cover, { contentType: cover.type });
        if (cErr) throw cErr;
        coverUrl = supabase.storage.from("book-covers").getPublicUrl(coverPath)
          .data.publicUrl;
      }
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
    } catch (err) {
      if (filePath) await supabase.storage.from("book-pdfs").remove([filePath]);
      if (coverPath)
        await supabase.storage.from("book-covers").remove([coverPath]);
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(
        msg.includes("Necesitas") ? msg : `No se pudo publicar: ${msg}`,
      );
    } finally {
      setSubmitting(false);
    }
  };
  const input =
    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary";
  const canAfford = (profile?.points ?? 0) >= UPLOAD_FEE;
  const form = /* @__PURE__ */ jsxs("form", {
    onSubmit: submit,
    className: "space-y-5",
    children: [
      /* @__PURE__ */ jsx("input", {
        ref: fileInputRef,
        type: "file",
        className: "hidden",
        accept: BOOK_FILE_ACCEPT,
        onChange: (e) => onFilePicked(e.target.files?.[0] ?? null),
      }),
      /* @__PURE__ */ jsxs("div", {
        children: [
          /* @__PURE__ */ jsx("label", {
            className: "mb-1 block text-sm font-bold",
            children: "Archivo del libro",
          }),
          /* @__PURE__ */ jsxs("button", {
            type: "button",
            onClick: pickFile,
            className:
              "neo-btn flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink bg-muted/50 px-4 py-6 font-bold hover:bg-muted",
            children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }),
              file
                ? file.name
                : "Toca aquí para abrir el explorador de archivos",
            ],
          }),
          file &&
            /* @__PURE__ */ jsxs("p", {
              className: "mt-1 text-xs text-muted-foreground",
              children: [
                (file.size / 1024 / 1024).toFixed(2),
                " MB — no ejecutables (.exe, .bat, etc.)",
              ],
            }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        children: [
          /* @__PURE__ */ jsx("label", {
            className: "mb-1 block text-sm font-bold",
            children: "Título",
          }),
          /* @__PURE__ */ jsx("input", {
            value: title,
            onChange: (e) => setTitle(e.target.value),
            className: input,
            maxLength: 200,
            required: true,
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        children: [
          /* @__PURE__ */ jsx("label", {
            className: "mb-1 block text-sm font-bold",
            children: "Autor (opcional)",
          }),
          /* @__PURE__ */ jsx("input", {
            value: author,
            onChange: (e) => setAuthor(e.target.value),
            className: input,
            maxLength: 120,
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        children: [
          /* @__PURE__ */ jsx("label", {
            className: "mb-1 block text-sm font-bold",
            children: "Descripción (opcional)",
          }),
          /* @__PURE__ */ jsx("textarea", {
            value: description,
            onChange: (e) => setDescription(e.target.value),
            rows: 3,
            className: input,
            maxLength: 2e3,
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        children: [
          /* @__PURE__ */ jsx("label", {
            className: "mb-1 block text-sm font-bold",
            children: "Portada (opcional)",
          }),
          /* @__PURE__ */ jsx("input", {
            type: "file",
            accept: "image/*",
            onChange: (e) => setCover(e.target.files?.[0] ?? null),
            className: input,
          }),
        ],
      }),
      /* @__PURE__ */ jsx("button", {
        type: "submit",
        disabled: submitting || !canAfford || !file,
        className:
          "neo-btn w-full rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50",
        children: submitting
          ? "Subiendo..."
          : canAfford
            ? `Publicar (-${UPLOAD_FEE} pts)`
            : `Te faltan ${UPLOAD_FEE - (profile?.points ?? 0)} pts`,
      }),
    ],
  });
  if (asDialog && open) {
    return /* @__PURE__ */ jsx("div", {
      className:
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs("div", {
        className: "neo-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "mb-4 flex items-center justify-between",
            children: [
              /* @__PURE__ */ jsx("h2", {
                className: "font-display text-2xl font-extrabold",
                children: "Subir libro",
              }),
              /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: onClose,
                "aria-label": "Cerrar",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }),
              }),
            ],
          }),
          profile &&
            /* @__PURE__ */ jsxs("p", {
              className:
                "mb-4 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold",
              children: [
                /* @__PURE__ */ jsx(Coins, { className: "h-4 w-4" }),
                " ",
                profile.points,
                " pts",
              ],
            }),
          form,
        ],
      }),
    });
  }
  return form;
}
export {
  BOOK_FILE_ACCEPT as B,
  UPLOAD_FEE as U,
  BookUploadForm as a,
  validateBookFile as v,
};
