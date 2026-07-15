import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { a as Route, u as useAuth } from "./router-BQQ5DE_J.js";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import "framer-motion";
import "./auth-CQiZqu43.js";
import "@supabase/supabase-js";
import "ai";
import "@ai-sdk/mistral";
const commentSchema = z.string().trim().min(1).max(2e3);
function PostDetail() {
  const {
    id
  } = Route.useParams();
  const {
    user,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const {
      data: p
    } = await supabase.from("posts").select(`id, title, content, cover_image_url, created_at, author_id,
        author:profiles!posts_author_profile_fkey(dni, full_name, level, grade),
        category:categories(name, emoji)`).eq("id", id).maybeSingle();
    setPost(p);
    const [{
      data: cs
    }, {
      count
    }, {
      data: liked2
    }] = await Promise.all([supabase.from("comments").select(`id, content, created_at, author_id,
        author:profiles!comments_author_profile_fkey(dni, full_name, level)`).eq("post_id", id).order("created_at", {
      ascending: true
    }), supabase.from("likes").select("*", {
      count: "exact",
      head: true
    }).eq("post_id", id), user ? supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({
      data: null
    })]);
    setComments(cs ?? []);
    setLikesCount(count ?? 0);
    setLiked(!!liked2);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [id, user?.id]);
  const toggleLike = async () => {
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
      setLiked(false);
      setLikesCount((n) => n - 1);
    } else {
      const {
        error
      } = await supabase.from("likes").insert({
        post_id: id,
        user_id: user.id
      });
      if (!error) {
        setLiked(true);
        setLikesCount((n) => n + 1);
      }
    }
  };
  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    const parsed = commentSchema.safeParse(newComment);
    if (!parsed.success) return;
    const {
      error
    } = await supabase.from("comments").insert({
      post_id: id,
      author_id: user.id,
      content: parsed.data
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewComment("");
    toast.success("Comentario publicado · +2 pts");
    load();
  };
  const deletePost = async () => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    const {
      error
    } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Eliminada");
    navigate({
      to: "/feed"
    });
  };
  const deleteComment = async (cid) => {
    const {
      error
    } = await supabase.from("comments").delete().eq("id", cid);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((cs) => cs.filter((c) => c.id !== cid));
  };
  if (loading) return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl p-8", children: /* @__PURE__ */ jsx("div", { className: "neo-card h-96 animate-pulse" }) })
  ] });
  if (!post) return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl p-8", children: /* @__PURE__ */ jsx("p", { children: "No encontrado." }) })
  ] });
  const canDeletePost = user && (user.id === post.author_id || isAdmin);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-4 py-8", children: [
      /* @__PURE__ */ jsxs("article", { className: "neo-card overflow-hidden", children: [
        post.cover_image_url && /* @__PURE__ */ jsx("img", { src: post.cover_image_url, alt: post.title, className: "aspect-[16/9] w-full border-b-2 border-ink object-cover" }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
            post.category && /* @__PURE__ */ jsxs("span", { className: "chip bg-lemon", children: [
              post.category.emoji,
              " ",
              post.category.name
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: new Date(post.created_at).toLocaleDateString("es", {
              dateStyle: "medium"
            }) })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-extrabold leading-tight md:text-5xl", children: post.title }),
          post.author && /* @__PURE__ */ jsxs(Link, { to: "/profile/$dni", params: {
            dni: post.author.dni
          }, className: "mt-4 inline-flex items-center gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2 hover:bg-muted", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-coral font-extrabold text-white", children: post.author.full_name.charAt(0) }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold", children: post.author.full_name }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                post.author.grade,
                " · Nivel ",
                post.author.level
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "prose prose-lg mt-6 max-w-none whitespace-pre-wrap leading-relaxed", children: post.content }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-center gap-3 border-t-2 border-ink pt-5", children: [
            /* @__PURE__ */ jsxs("button", { onClick: toggleLike, className: `neo-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 font-bold ${liked ? "bg-coral text-white" : "bg-card"}`, children: [
              /* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${liked ? "fill-current" : ""}` }),
              " ",
              likesCount
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-bold", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
              " ",
              comments.length
            ] }),
            canDeletePost && /* @__PURE__ */ jsxs("button", { onClick: deletePost, className: "ml-auto inline-flex items-center gap-1 rounded-lg border-2 border-ink bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
              " Eliminar"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-extrabold", children: "Comentarios" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submitComment, className: "neo-card mt-3 flex items-start gap-2 p-3", children: [
          /* @__PURE__ */ jsx("textarea", { value: newComment, onChange: (e) => setNewComment(e.target.value), maxLength: 2e3, rows: 2, placeholder: user ? "Aporta algo a esta publicación..." : "Inicia sesión para comentar", disabled: !user, className: "flex-1 resize-none rounded-md border-2 border-ink bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" }),
          /* @__PURE__ */ jsx("button", { disabled: !user || !newComment.trim(), className: "neo-btn rounded-lg bg-primary p-3 text-primary-foreground disabled:opacity-50", children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
          comments.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aún sin comentarios. ¡Sé el primero!" }),
          comments.map((c) => /* @__PURE__ */ jsx("div", { className: "neo-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint font-extrabold text-ink", children: c.author?.full_name?.charAt(0) ?? "?" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                c.author && /* @__PURE__ */ jsx(Link, { to: "/profile/$dni", params: {
                  dni: c.author.dni
                }, className: "font-bold hover:underline", children: c.author.full_name }),
                /* @__PURE__ */ jsxs("span", { className: "chip bg-lemon", children: [
                  "Lv ",
                  c.author?.level ?? 1
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.created_at).toLocaleDateString("es") }),
                (user?.id === c.author_id || isAdmin) && /* @__PURE__ */ jsx("button", { onClick: () => deleteComment(c.id), className: "ml-auto text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 whitespace-pre-wrap", children: c.content })
            ] })
          ] }) }, c.id))
        ] })
      ] })
    ] })
  ] });
}
export {
  PostDetail as component
};
