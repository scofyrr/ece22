import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const truncate = (text: string | null | undefined, max: number) => {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
};

type PostRow = {
  title: string;
  content: string;
  created_at: string;
  featured: boolean;
  profiles: { full_name: string; grade: string } | null;
  categories: { name: string; emoji: string } | null;
};

type BookRow = {
  title: string;
  author: string | null;
  description: string | null;
  price_points: number;
  file_ext: string | null;
  created_at: string;
  profiles: { full_name: string; grade: string } | null;
};

type ProfileRow = {
  full_name: string;
  grade: string;
  max_points: number;
  points: number;
  level: number;
};

/** Snapshot público de la plataforma — sin DNI, emails ni rutas internas. */
export async function fetchPlatformContext(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const [
    postsRes,
    booksRes,
    rankingRes,
    categoriesRes,
    postCountRes,
    bookCountRes,
    userCountRes,
  ] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "title, content, created_at, featured, profiles!posts_author_profile_fkey(full_name, grade), categories(name, emoji)",
      )
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("books")
      .select(
        "title, author, description, price_points, file_ext, created_at, profiles!books_owner_id_fkey(full_name, grade)",
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("full_name, grade, max_points, points, level")
      .gt("max_points", 0)
      .order("max_points", { ascending: false })
      .limit(10),
    supabase.from("categories").select("name, emoji, slug").order("name"),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const sections: string[] = [];

  sections.push(
    `### Estadísticas generales\n- Usuarios registrados: ${userCountRes.count ?? "?"}\n- Posts en el feed: ${postCountRes.count ?? "?"}\n- Libros en biblioteca: ${bookCountRes.count ?? "?"}`,
  );

  const categories = categoriesRes.data ?? [];
  if (categories.length > 0) {
    sections.push(
      `### Categorías del feed\n${categories.map((c) => `- ${c.emoji} ${c.name} (${c.slug})`).join("\n")}`,
    );
  }

  const posts = (postsRes.data ?? []) as PostRow[];
  if (posts.length > 0) {
    sections.push(
      `### Posts recientes del feed (${posts.length} últimos)\n${posts
        .map((p, i) => {
          const who = p.profiles
            ? `${p.profiles.full_name} (${p.profiles.grade})`
            : "Autor desconocido";
          const cat = p.categories
            ? `${p.categories.emoji} ${p.categories.name}`
            : "Sin categoría";
          const feat = p.featured ? " [DESTACADO]" : "";
          return `${i + 1}. **${p.title}**${feat}\n   Autor: ${who} | Categoría: ${cat} | Fecha: ${p.created_at.slice(0, 10)}\n   ${truncate(p.content, 280)}`;
        })
        .join("\n\n")}`,
    );
  } else {
    sections.push(
      "### Posts recientes\n(Aún no hay publicaciones en el feed.)",
    );
  }

  const books = (booksRes.data ?? []) as BookRow[];
  if (books.length > 0) {
    sections.push(
      `### Libros en la biblioteca digital (${books.length} últimos)\n${books
        .map((b, i) => {
          const who = b.profiles
            ? `${b.profiles.full_name} (${b.profiles.grade})`
            : "Autor desconocido";
          const fmt = b.file_ext?.toUpperCase() ?? "archivo";
          return `${i + 1}. **${b.title}** — ${b.price_points} pts | Formato: ${fmt}\n   Subido por: ${who}${b.author ? ` | Autor del libro: ${b.author}` : ""}\n   ${truncate(b.description, 200) || "(sin descripción)"}`;
        })
        .join("\n\n")}`,
    );
  } else {
    sections.push("### Biblioteca digital\n(Aún no hay libros subidos.)");
  }

  const ranking = (rankingRes.data ?? []) as ProfileRow[];
  if (ranking.length > 0) {
    sections.push(
      `### Ranking (por max_points — pico histórico)\n${ranking
        .map(
          (r, i) =>
            `${i + 1}. ${r.full_name} (${r.grade}) — ${r.max_points} pts máx | ${r.points} pts actuales | Nivel ${r.level}`,
        )
        .join("\n")}`,
    );
  } else {
    sections.push("### Ranking\n(Sin actividad registrada aún.)");
  }

  if (postsRes.error)
    sections.push(
      `(Aviso: error parcial al leer posts: ${postsRes.error.message})`,
    );
  if (booksRes.error)
    sections.push(
      `(Aviso: error parcial al leer libros: ${booksRes.error.message})`,
    );

  return sections.join("\n\n");
}
