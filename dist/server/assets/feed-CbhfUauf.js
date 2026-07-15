import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { P as PostCard } from "./PostCard-JalY36Tl.js";
import { Sparkles, Filter } from "lucide-react";
import { s as supabase } from "./client-DIhsBbtt.js";
import "framer-motion";
import "./router-BQQ5DE_J.js";
import "sonner";
import "zod";
import "@supabase/supabase-js";
import "ai";
import "@ai-sdk/mistral";
import "./auth-CQiZqu43.js";
function DestacadosCarousel({ items }) {
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs("section", {
    className: "mb-8",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: "mb-3 flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", {
            className: "font-display text-2xl font-extrabold",
            children: "Destacados",
          }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        className: "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3",
        children: items.map((p) =>
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/post/$id",
              params: { id: p.id },
              className:
                "neo-card group relative w-64 shrink-0 snap-start overflow-hidden",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className: "h-32 w-full bg-cover bg-center",
                  style: {
                    backgroundImage: p.cover_image_url
                      ? `url(${p.cover_image_url})`
                      : "linear-gradient(135deg, color-mix(in oklab, var(--primary) 30%, transparent), color-mix(in oklab, var(--coral) 25%, transparent))",
                  },
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "p-3",
                  children: [
                    p.category &&
                      /* @__PURE__ */ jsxs("span", {
                        className: "chip mb-2 bg-lemon text-xs",
                        children: [p.category.emoji, " ", p.category.name],
                      }),
                    /* @__PURE__ */ jsx("h3", {
                      className:
                        "line-clamp-2 font-display text-sm font-extrabold",
                      children: p.title,
                    }),
                    p.author &&
                      /* @__PURE__ */ jsxs("p", {
                        className:
                          "mt-1 truncate text-xs text-muted-foreground",
                        children: ["por ", p.author.full_name],
                      }),
                  ],
                }),
              ],
            },
            p.id,
          ),
        ),
      }),
    ],
  });
}
function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,slug,emoji")
      .order("name")
      .then(({ data }) => {
        setCategories(data ?? []);
      });
    supabase
      .from("posts")
      .select(
        `id, title, cover_image_url,
        author:profiles!posts_author_profile_fkey(full_name, dni),
        category:categories(name, emoji)`,
      )
      .eq("featured", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(8)
      .then(({ data }) => setDestacados(data ?? []));
  }, []);
  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select(
        `id, title, content, cover_image_url, created_at,
        author:profiles!posts_author_profile_fkey(dni, full_name, level),
        category:categories(name, emoji, slug),
        likes(count), comments(count)`,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(50);
    if (activeCat) q = q.eq("category_id", activeCat);
    q.then(({ data }) => {
      const mapped = (data ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        cover_image_url: p.cover_image_url,
        created_at: p.created_at,
        author: p.author,
        category: p.category,
        likes_count: p.likes?.[0]?.count ?? 0,
        comments_count: p.comments?.[0]?.count ?? 0,
      }));
      setPosts(mapped);
      setLoading(false);
    });
  }, [activeCat]);
  return /* @__PURE__ */ jsxs("div", {
    className: "relative min-h-screen",
    children: [
      /* @__PURE__ */ jsxs("div", {
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        children: [
          /* @__PURE__ */ jsx("div", {
            className:
              "absolute -left-32 top-32 h-96 w-96 rounded-full bg-primary/12 blur-[100px]",
          }),
          /* @__PURE__ */ jsx("div", {
            className:
              "absolute right-0 top-1/2 h-80 w-80 rounded-full bg-andino-ocre/0 blur-3xl",
            style: {
              backgroundColor:
                "color-mix(in oklab, var(--andino-ocre) 18%, transparent)",
            },
          }),
          /* @__PURE__ */ jsx("div", {
            className:
              "absolute left-1/3 bottom-0 h-96 w-96 rounded-full blur-[110px]",
            style: {
              backgroundColor:
                "color-mix(in oklab, var(--andino-selva) 14%, transparent)",
            },
          }),
        ],
      }),
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsxs("main", {
        className: "mx-auto max-w-6xl px-4 py-8",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("h1", {
                    className: "font-display text-4xl font-extrabold",
                    style: {
                      textShadow:
                        "0 2px 30px color-mix(in oklab, var(--primary) 20%, transparent)",
                    },
                    children: "Feed",
                  }),
                  /* @__PURE__ */ jsx("p", {
                    className: "text-muted-foreground",
                    children: "Lo último que la comunidad está enseñando.",
                  }),
                ],
              }),
              /* @__PURE__ */ jsx(Link, {
                to: "/new",
                className:
                  "neo-btn rounded-lg bg-lemon px-4 py-2 font-bold text-ink glow-bloom",
                children: "+ Publicar algo",
              }),
            ],
          }),
          destacados.length > 0 &&
            /* @__PURE__ */ jsx(DestacadosCarousel, { items: destacados }),
          /* @__PURE__ */ jsxs("div", {
            className: "mb-6 flex flex-wrap items-center gap-2",
            children: [
              /* @__PURE__ */ jsxs("span", {
                className: "inline-flex items-center gap-1 text-sm font-bold",
                children: [
                  /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
                  " Filtrar:",
                ],
              }),
              /* @__PURE__ */ jsx("button", {
                onClick: () => setActiveCat(null),
                className: `chip ${!activeCat ? "bg-primary text-primary-foreground" : "bg-card"}`,
                children: "Todas",
              }),
              categories.map((c) =>
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setActiveCat(c.id),
                    className: `chip ${activeCat === c.id ? "bg-primary text-primary-foreground" : "bg-card"}`,
                    children: [c.emoji, " ", c.name],
                  },
                  c.id,
                ),
              ),
            ],
          }),
          loading
            ? /* @__PURE__ */ jsx("div", {
                className: "grid gap-6 md:grid-cols-2",
                children: [...Array(4)].map((_, i) =>
                  /* @__PURE__ */ jsx(
                    "div",
                    { className: "neo-card h-64 animate-pulse" },
                    i,
                  ),
                ),
              })
            : posts.length === 0
              ? /* @__PURE__ */ jsxs("div", {
                  className: "neo-card p-10 text-center",
                  children: [
                    /* @__PURE__ */ jsx("p", {
                      className: "font-display text-2xl font-bold",
                      children: "Aún no hay publicaciones aquí.",
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-1 text-muted-foreground",
                      children: "¡Sé el primero en compartir algo!",
                    }),
                    /* @__PURE__ */ jsx(Link, {
                      to: "/new",
                      className:
                        "neo-btn mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground",
                      children: "Publicar",
                    }),
                  ],
                })
              : /* @__PURE__ */ jsx("div", {
                  className: "grid gap-6 md:grid-cols-2",
                  children: posts.map((p) =>
                    /* @__PURE__ */ jsx(PostCard, { post: p }, p.id),
                  ),
                }),
        ],
      }),
    ],
  });
}
export { FeedPage as component };
