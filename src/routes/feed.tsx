import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PostCard, { type PostCardData } from "@/components/PostCard";
import DestacadosCarousel, { type DestacadoItem } from "@/components/DestacadosCarousel";
import { supabase } from "@/integrations/supabase/client";
import { Filter } from "lucide-react";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Feed — Colegio JCM" }, { name: "description", content: "Descubre publicaciones de estudiantes." }] }),
  component: FeedPage,
});

type Category = { id: string; name: string; slug: string; emoji: string };

function FeedPage() {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [destacados, setDestacados] = useState<DestacadoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("id,name,slug,emoji").order("name").then(({ data }) => {
      setCategories((data ?? []) as Category[]);
    });
    // Destacados (publicaciones marcadas como featured)
    supabase
      .from("posts")
      .select(`id, title, cover_image_url,
        author:profiles!posts_author_profile_fkey(full_name, dni),
        category:categories(name, emoji)`)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setDestacados(((data ?? []) as unknown) as DestacadoItem[]));
  }, []);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select(`id, title, content, cover_image_url, created_at,
        author:profiles!posts_author_profile_fkey(dni, full_name, level),
        category:categories(name, emoji, slug),
        likes(count), comments(count)`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (activeCat) q = q.eq("category_id", activeCat);

    q.then(({ data }) => {
      const mapped: PostCardData[] = (data ?? []).map((p: any) => ({
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

  return (
    <div className="relative min-h-screen">
      {/* Aurora bloom de fondo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-primary/12 blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-andino-ocre/0 blur-3xl" style={{ backgroundColor: "color-mix(in oklab, var(--andino-ocre) 18%, transparent)" }} />
        <div className="absolute left-1/3 bottom-0 h-96 w-96 rounded-full blur-[110px]" style={{ backgroundColor: "color-mix(in oklab, var(--andino-selva) 14%, transparent)" }} />
      </div>

      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-extrabold" style={{ textShadow: "0 2px 30px color-mix(in oklab, var(--primary) 20%, transparent)" }}>Feed</h1>
            <p className="text-muted-foreground">Lo último que la comunidad está enseñando.</p>
          </div>
          <Link to="/new" className="neo-btn rounded-lg bg-lemon px-4 py-2 font-bold text-ink glow-bloom">
            + Publicar algo
          </Link>
        </div>

        {destacados.length > 0 && <DestacadosCarousel items={destacados} />}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Filter className="h-4 w-4" /> Filtrar:</span>
          <button
            onClick={() => setActiveCat(null)}
            className={`chip ${!activeCat ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >Todas</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`chip ${activeCat === c.id ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >{c.emoji} {c.name}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <div key={i} className="neo-card h-64 animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="neo-card p-10 text-center">
            <p className="font-display text-2xl font-bold">Aún no hay publicaciones aquí.</p>
            <p className="mt-1 text-muted-foreground">¡Sé el primero en compartir algo!</p>
            <Link to="/new" className="neo-btn mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground">Publicar</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
