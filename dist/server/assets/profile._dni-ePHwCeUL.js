import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { P as PostCard } from "./PostCard-JalY36Tl.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { Trophy, Sparkles, BookOpen } from "lucide-react";
import { R as Route } from "./router-BQQ5DE_J.js";
import "@tanstack/react-router";
import "framer-motion";
import "./auth-CQiZqu43.js";
import "@supabase/supabase-js";
import "sonner";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function ProfilePage() {
  const {
    dni
  } = Route.useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const {
        data: p
      } = await supabase.from("profiles").select("*").eq("dni", dni).maybeSingle();
      setProfile(p);
      if (p) {
        const {
          data: ps
        } = await supabase.from("posts").select(`id, title, content, cover_image_url, created_at,
            author:profiles!posts_author_profile_fkey(dni, full_name, level),
            category:categories(name, emoji, slug),
            likes(count), comments(count)`).eq("author_id", p.id).order("created_at", {
          ascending: false
        });
        setPosts((ps ?? []).map((x) => ({
          id: x.id,
          title: x.title,
          content: x.content,
          cover_image_url: x.cover_image_url,
          created_at: x.created_at,
          author: x.author,
          category: x.category,
          likes_count: x.likes?.[0]?.count ?? 0,
          comments_count: x.comments?.[0]?.count ?? 0
        })));
      }
      setLoading(false);
    })();
  }, [dni]);
  if (loading) return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-4xl p-8", children: /* @__PURE__ */ jsx("div", { className: "neo-card h-48 animate-pulse" }) })
  ] });
  if (!profile) return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-4xl p-8", children: /* @__PURE__ */ jsx("p", { children: "Usuario no encontrado." }) })
  ] });
  profile.level * 100;
  const progress = Math.min(100, profile.points % 100);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-4xl px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-card p-6 md:p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-5 md:flex-row md:items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-ink bg-coral text-4xl font-extrabold text-white shadow-[6px_6px_0_0_var(--ink)]", children: profile.full_name.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: profile.full_name }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
              profile.grade,
              " · DNI ",
              profile.dni
            ] }),
            profile.bio && /* @__PURE__ */ jsx("p", { className: "mt-2", children: profile.bio }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "chip bg-lemon", children: [
                /* @__PURE__ */ jsx(Trophy, { className: "h-3.5 w-3.5" }),
                " Nivel ",
                profile.level
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "chip bg-mint", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                " ",
                profile.points,
                " pts"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "chip bg-sky", children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }),
                " ",
                posts.length,
                " publicaciones"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1 flex justify-between text-xs font-bold", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Nivel ",
              profile.level
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              progress,
              "/100 → Nivel ",
              profile.level + 1
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-card", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary", style: {
            width: `${progress}%`
          } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "mt-8 font-display text-2xl font-extrabold", children: "Publicaciones" }),
      posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: "Aún no ha publicado nada." }) : /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-6 md:grid-cols-2", children: posts.map((p) => /* @__PURE__ */ jsx(PostCard, { post: p }, p.id)) })
    ] })
  ] });
}
export {
  ProfilePage as component
};
