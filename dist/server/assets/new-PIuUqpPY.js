import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { toast } from "sonner";
import { z } from "zod";
import "framer-motion";
import "./auth-CQiZqu43.js";
import "lucide-react";
import "@supabase/supabase-js";
import "ai";
import "@ai-sdk/mistral";
const schema = z.object({
  title: z.string().trim().min(3, "Título muy corto").max(200),
  content: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(2e4),
  category_id: z.string().uuid("Elige una categoría"),
  cover_image_url: z.string().url().or(z.literal("")).optional()
});
function NewPostPage() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!authLoading && !user) navigate({
      to: "/login"
    });
  }, [authLoading, user, navigate]);
  useEffect(() => {
    supabase.from("categories").select("id,name,emoji").order("name").then(({
      data
    }) => {
      setCategories(data ?? []);
      if (data && data.length) setCategoryId(data[0].id);
    });
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      title,
      content,
      category_id: categoryId,
      cover_image_url: coverUrl
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const {
      data,
      error
    } = await supabase.from("posts").insert({
      author_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      category_id: parsed.data.category_id,
      cover_image_url: parsed.data.cover_image_url || null
    }).select("id").single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("¡Publicado! +10 puntos 🎉");
    navigate({
      to: "/post/$id",
      params: {
        id: data.id
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-4 py-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-extrabold", children: "Comparte lo que sabes" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cualquier aporte cuenta — un truco, un consejo o una explicación." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "neo-card mt-6 space-y-5 p-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-bold", children: "Título" }),
          /* @__PURE__ */ jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), maxLength: 200, placeholder: "Ej. Cómo memorizar fórmulas trigonométricas", className: "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-bold", children: "Categoría" }),
          /* @__PURE__ */ jsx("select", { value: categoryId, onChange: (e) => setCategoryId(e.target.value), className: "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary", children: categories.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
            c.emoji,
            " ",
            c.name
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "mb-1 block text-sm font-bold", children: [
            "Imagen de portada ",
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "(URL opcional)" })
          ] }),
          /* @__PURE__ */ jsx("input", { value: coverUrl, onChange: (e) => setCoverUrl(e.target.value), placeholder: "https://...", className: "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "mb-1 block text-sm font-bold", children: "Contenido" }),
          /* @__PURE__ */ jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), rows: 12, maxLength: 2e4, placeholder: "Explica con tus palabras…", className: "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-right text-xs text-muted-foreground", children: [
            content.length,
            "/20000"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { disabled: submitting, className: "neo-btn rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50", children: submitting ? "Publicando..." : "Publicar" })
      ] })
    ] })
  ] });
}
export {
  NewPostPage as component
};
