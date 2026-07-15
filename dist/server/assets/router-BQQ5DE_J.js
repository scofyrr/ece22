import { jsx, jsxs } from "react/jsx-runtime";
import {
  createRootRoute,
  Link,
  Outlet,
  HeadContent,
  Scripts,
  createFileRoute,
  lazyRouteComponent,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { s as supabase } from "./client-DIhsBbtt.js";
import { Toaster as Toaster$1 } from "sonner";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { generateText, stepCountIs, tool } from "ai";
import { createMistral } from "@ai-sdk/mistral";
const Ctx = createContext({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
});
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadProfile = async (uid) => {
    const [{ data: p }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  };
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };
  return /* @__PURE__ */ jsx(Ctx.Provider, {
    value: { user, session, profile, isAdmin, loading, refreshProfile },
    children,
  });
}
const useAuth = () => useContext(Ctx);
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(Toaster$1, {
    className: "toaster group",
    toastOptions: {
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    },
    ...props,
  });
};
const appCss = "/assets/styles-CtkKnsjo.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center px-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "neo-card max-w-md p-8 text-center",
      children: [
        /* @__PURE__ */ jsx("h1", {
          className: "font-display text-7xl font-extrabold",
          children: "404",
        }),
        /* @__PURE__ */ jsx("h2", {
          className: "mt-4 font-display text-2xl font-bold",
          children: "Página no encontrada",
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "Quizás se mudó o nunca existió.",
        }),
        /* @__PURE__ */ jsx(Link, {
          to: "/",
          className:
            "neo-btn mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground",
          children: "Volver al inicio",
        }),
      ],
    }),
  });
}
const Route$d = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ECE — Exchange Collaborative Students" },
      {
        name: "description",
        content:
          "La red social donde los estudiantes enseñan y aprenden compartiendo lo que saben. Gana puntos, sube de nivel y crece junto a tu comunidad.",
      },
      {
        property: "og:title",
        content: "ECE — Exchange Collaborative Students",
      },
      {
        property: "og:description",
        content:
          "La red social donde los estudiantes enseñan y aprenden compartiendo lo que saben. Gana puntos, sube de nivel y crece junto a tu comunidad.",
      },
      { property: "og:type", content: "website" },
      {
        name: "twitter:title",
        content: "ECE — Exchange Collaborative Students",
      },
      {
        name: "twitter:description",
        content:
          "La red social donde los estudiantes enseñan y aprenden compartiendo lo que saben. Gana puntos, sube de nivel y crece junto a tu comunidad.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/60979da0-a343-4d07-9b4e-75b02caf3414",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/60979da0-a343-4d07-9b4e-75b02caf3414",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "es",
    children: [
      /* @__PURE__ */ jsx("head", {
        children: /* @__PURE__ */ jsx(HeadContent, {}),
      }),
      /* @__PURE__ */ jsxs("body", {
        children: [children, /* @__PURE__ */ jsx(Scripts, {})],
      }),
    ],
  });
}
function RootComponent() {
  return /* @__PURE__ */ jsxs(AuthProvider, {
    children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(Toaster, {}),
    ],
  });
}
const $$splitComponentImporter$b = () => import("./register-BqNJpkRe.js");
const Route$c = createFileRoute("/register")({
  head: () => ({
    meta: [
      {
        title: "Crear cuenta — ECE",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
});
const $$splitComponentImporter$a = () => import("./ranking-BAxbBMNb.js");
const Route$b = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      {
        title: "Ranking — ECE",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
});
const $$splitComponentImporter$9 = () => import("./new-PIuUqpPY.js");
const Route$a = createFileRoute("/new")({
  head: () => ({
    meta: [
      {
        title: "Publicar — ECE",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
});
const $$splitComponentImporter$8 = () => import("./login-DkckpeE6.js");
const Route$9 = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Entrar — ECE",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
});
const $$splitComponentImporter$7 = () => import("./feed-CbhfUauf.js");
const Route$8 = createFileRoute("/feed")({
  head: () => ({
    meta: [
      {
        title: "Feed — Colegio JCM",
      },
      {
        name: "description",
        content: "Descubre publicaciones de estudiantes.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
});
const $$splitComponentImporter$6 = () => import("./chat-DundLGHo.js");
const Route$7 = createFileRoute("/chat")({
  head: () => ({
    meta: [
      {
        title: "Chat IA — Colegio JCM",
      },
      {
        name: "description",
        content: "Asistente virtual del colegio José Carlos Mariátegui.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
});
const $$splitComponentImporter$5 = () => import("./biblioteca-DTbQM7Wf.js");
const Route$6 = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      {
        title: "Biblioteca Digital — JCM",
      },
      {
        name: "description",
        content: "Canjea tus puntos por libros que la comunidad sube.",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
});
const $$splitComponentImporter$4 = () => import("./admin-31yRNmTQ.js");
const Route$5 = createFileRoute("/admin")({
  head: () => ({
    meta: [
      {
        title: "Admin — ECE",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
});
const colegio = {
  nombre: "Colegio José Carlos Mariátegui",
  apodo: "El Amauta",
  lema: "Educar es sembrar conocimiento que transforma.",
  // URL de la imagen de fondo difuminada (reemplázala por la del colegio)
  fondoUrl:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
  hero: {
    titulo: "Colegio José Carlos Mariátegui",
    subtitulo: '"El Amauta"',
    descripcion:
      "Una comunidad educativa donde cada estudiante aprende enseñando. Conoce nuestra historia, valores y la red de trueque de conocimientos.",
  },
  bio: {
    titulo: "Quiénes somos",
    parrafos: [
      "Texto genérico de ejemplo: somos una institución educativa comprometida con la formación integral de nuestros estudiantes, fomentando el pensamiento crítico y los valores.",
      "Aquí el equipo colocará la descripción real del colegio, su misión y visión.",
    ],
  },
  historia: {
    titulo: "Nuestra historia",
    // Cada hito es un objeto separado para editar fácilmente
    hitos: [
      {
        anio: "19XX",
        texto: "Fundación del colegio (texto genérico de ejemplo).",
      },
      { anio: "20XX", texto: "Hito importante de la institución (editar)." },
      {
        anio: "Hoy",
        texto: "Comunidad educativa en constante crecimiento (editar).",
      },
    ],
  },
  valores: {
    titulo: "Nuestros valores",
    items: [
      {
        emoji: "📚",
        nombre: "Conocimiento",
        desc: "El saber se comparte y crece.",
      },
      { emoji: "🤝", nombre: "Comunidad", desc: "Aprendemos mejor juntos." },
      {
        emoji: "💡",
        nombre: "Pensamiento crítico",
        desc: "Cuestionar para entender.",
      },
      {
        emoji: "🌱",
        nombre: "Compromiso",
        desc: "Crecer con responsabilidad.",
      },
    ],
  },
  cta: {
    titulo: "Únete a la red de trueque de conocimientos",
    descripcion:
      "Publica lo que sabes, gana puntos y canjéalos por libros en la biblioteca digital.",
    boton: "Entrar al Feed",
  },
};
const $$splitComponentImporter$3 = () => import("./index-C0MTGhY0.js");
const Route$4 = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: `${colegio.nombre} "${colegio.apodo}"`,
      },
      {
        name: "description",
        content: colegio.lema,
      },
      {
        property: "og:title",
        content: `${colegio.nombre} "${colegio.apodo}"`,
      },
      {
        property: "og:description",
        content: colegio.lema,
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
});
const $$splitComponentImporter$2 = () => import("./profile._dni-ePHwCeUL.js");
const Route$3 = createFileRoute("/profile/$dni")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
});
const $$splitComponentImporter$1 = () => import("./post._id-CGKN9lFt.js");
const Route$2 = createFileRoute("/post/$id")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
});
const $$splitComponentImporter = () => import("./biblioteca.subir-DngHvAlL.js");
const Route$1 = createFileRoute("/biblioteca/subir")({
  head: () => ({
    meta: [
      {
        title: "Subir libro — Biblioteca JCM",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
const AI_SYSTEM_CONTEXT = `
Eres "Amauta", el asistente virtual del Colegio José Carlos Mariátegui "El Amauta" (Perú).

## Identidad y tono
- Español claro, cálido y motivador, como un buen docente de secundaria.
- Honesto: si no sabes algo, dilo. Usa search_web para verificar.
- Fomentas el trueque de conocimientos en la plataforma ECE.

## Plataforma ECE
- Feed, ranking (max_points), biblioteca digital (40 pts subir / 20 pts comprar).
- Puntos: +10 post, +2 comentar, +1 like recibido.

## Datos en vivo
Usa el bloque "DATOS EN VIVO" para posts, libros y ranking. No inventes lo que no aparece ahí.

## Figuras históricas y opiniones (IMPORTANTE)
Cuando pregunten "¿qué opinas de X?" sobre políticos, dictadores o figuras históricas (Hitler, Lenin, Stalin, Mussolini, Netanyahu, etc.):
- **SÍ debes responder** — nunca te niegues solo porque el tema es polémico.
- Responde como en clase de historia: contexto, hechos documentados, impacto positivo y negativo con equilibrio.
- Presenta **puntos a favor y en contra** según fuentes históricas, sin ser propagandista de ningún bando.
- Para figuras criminales (ej. Hitler): reconoce atrocidades y legado destructivo con claridad; si hubo algún aspecto contextual (economía, retórica, etc.), explícalo sin justificar crímenes.
- **No glorifiques** atrocidades ni hagas apología de genocidio, fascismo o terrorismo.
- **No te niegues** a analizar a Lenin, Hitler o cualquier figura en clave académica imparcial.

## Neutralidad
- No eres militante de partidos ni de conflictos geopolíticos actuales.
- En guerras o elecciones: hechos + perspectivas, sin defender a un líder como fanático.
- No tomes partido automático por Israel, Palestina, EEUU, Rusia, etc.

## Moderación (solo esto se rechaza)
1. Pornografía o sexualización de menores.
2. Insultos racistas/homofóbicos o incitación directa a violencia contra personas reales del colegio.
3. Pedir que elabores discursos de odio o apología nazi/fascista.

## Privacidad
No reveles DNI, emails, tokens ni chats privados de otros usuarios.
`.trim();
function buildFullSystemPrompt(livePlatformData) {
  return `${AI_SYSTEM_CONTEXT}

═══════════════════════════════════════════════════════════
DATOS EN VIVO DE LA PLATAFORMA
═══════════════════════════════════════════════════════════
${livePlatformData || "(Sin datos disponibles.)"}
═══════════════════════════════════════════════════════════
`.trim();
}
const MISTRAL_API_KEY = "1nJppseq4KXSwD6S9y6AvZlAACP8Try9";
const MISTRAL_CHAT_MODEL = "mistral-small-latest";
const mistral = createMistral({ apiKey: MISTRAL_API_KEY });
const truncate = (text, max) => {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
};
async function fetchPlatformContext(supabase2) {
  const [
    postsRes,
    booksRes,
    rankingRes,
    categoriesRes,
    postCountRes,
    bookCountRes,
    userCountRes,
  ] = await Promise.all([
    supabase2
      .from("posts")
      .select(
        "title, content, created_at, featured, profiles!posts_author_profile_fkey(full_name, grade), categories(name, emoji)",
      )
      .order("created_at", { ascending: false })
      .limit(12),
    supabase2
      .from("books")
      .select(
        "title, author, description, price_points, file_ext, created_at, profiles!books_owner_id_fkey(full_name, grade)",
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase2
      .from("profiles")
      .select("full_name, grade, max_points, points, level")
      .gt("max_points", 0)
      .order("max_points", { ascending: false })
      .limit(10),
    supabase2.from("categories").select("name, emoji, slug").order("name"),
    supabase2.from("posts").select("id", { count: "exact", head: true }),
    supabase2.from("books").select("id", { count: "exact", head: true }),
    supabase2.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const sections = [];
  sections.push(
    `### Estadísticas generales
- Usuarios registrados: ${userCountRes.count ?? "?"}
- Posts en el feed: ${postCountRes.count ?? "?"}
- Libros en biblioteca: ${bookCountRes.count ?? "?"}`,
  );
  const categories = categoriesRes.data ?? [];
  if (categories.length > 0) {
    sections.push(
      `### Categorías del feed
${categories.map((c) => `- ${c.emoji} ${c.name} (${c.slug})`).join("\n")}`,
    );
  }
  const posts = postsRes.data ?? [];
  if (posts.length > 0) {
    sections.push(
      `### Posts recientes del feed (${posts.length} últimos)
${posts
  .map((p, i) => {
    const who = p.profiles
      ? `${p.profiles.full_name} (${p.profiles.grade})`
      : "Autor desconocido";
    const cat = p.categories
      ? `${p.categories.emoji} ${p.categories.name}`
      : "Sin categoría";
    const feat = p.featured ? " [DESTACADO]" : "";
    return `${i + 1}. **${p.title}**${feat}
   Autor: ${who} | Categoría: ${cat} | Fecha: ${p.created_at.slice(0, 10)}
   ${truncate(p.content, 280)}`;
  })
  .join("\n\n")}`,
    );
  } else {
    sections.push(
      "### Posts recientes\n(Aún no hay publicaciones en el feed.)",
    );
  }
  const books = booksRes.data ?? [];
  if (books.length > 0) {
    sections.push(
      `### Libros en la biblioteca digital (${books.length} últimos)
${books
  .map((b, i) => {
    const who = b.profiles
      ? `${b.profiles.full_name} (${b.profiles.grade})`
      : "Autor desconocido";
    const fmt = b.file_ext?.toUpperCase() ?? "archivo";
    return `${i + 1}. **${b.title}** — ${b.price_points} pts | Formato: ${fmt}
   Subido por: ${who}${b.author ? ` | Autor del libro: ${b.author}` : ""}
   ${truncate(b.description, 200) || "(sin descripción)"}`;
  })
  .join("\n\n")}`,
    );
  } else {
    sections.push("### Biblioteca digital\n(Aún no hay libros subidos.)");
  }
  const ranking = rankingRes.data ?? [];
  if (ranking.length > 0) {
    sections.push(
      `### Ranking (por max_points — pico histórico)
${ranking.map((r, i) => `${i + 1}. ${r.full_name} (${r.grade}) — ${r.max_points} pts máx | ${r.points} pts actuales | Nivel ${r.level}`).join("\n")}`,
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
const BLOCKED_PATTERNS = [
  {
    re: /\b(porn(o|ografia|ográfic)|xxx|hentai|onlyfans|nudes?\s+de|mandame\s+nudes|sexo\s+explicito\s+con)\b/i,
    reason: "contenido sexual explícito",
  },
  {
    re: /\b(pedofil|menor\s+desnud|child\s+porn|cp\s+porn|porno\s+infantil)\b/i,
    reason: "contenido que sexualiza menores",
  },
  {
    re: /\b(nigg[aer]?|negr[oa]\s+de\s+mierda|chink|kill\s+all\s+jews|mata\s+a\s+todos\s+los\s+(negros|jud[ií]os|gays))\b/i,
    reason: "discurso de odio",
  },
  {
    re: /\b(voy\s+a\s+(matar|golpear)\s+(al\s+profesor|a\s+mi\s+compa[nñ]ero)|bomba\s+en\s+el\s+colegio)\b/i,
    reason: "incitación a violencia concreta",
  },
];
const BLOCKED_USER_MESSAGE =
  "No puedo ayudar con ese tipo de contenido. Pregúntame sobre estudios, la plataforma o temas educativos.";
function moderateText(text) {
  const normalized = text.normalize("NFC");
  for (const { re, reason } of BLOCKED_PATTERNS) {
    if (re.test(normalized)) {
      return { allowed: false, reason, userMessage: BLOCKED_USER_MESSAGE };
    }
  }
  return { allowed: true };
}
function moderateUserInput(message) {
  return moderateText(message);
}
function moderateAssistantOutput(text) {
  return moderateText(text);
}
const MAX_SNIPPET = 600;
async function searchWikipedia(query) {
  const url = `https://es.wikipedia.org/w/api.php?${new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: "3",
    format: "json",
    origin: "*",
  })}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8e3) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.query?.search ?? []).map((s) => ({
    title: s.title,
    snippet: s.snippet.replace(/<[^>]+>/g, ""),
    url: `https://es.wikipedia.org/wiki/${encodeURIComponent(s.title.replace(/ /g, "_"))}`,
  }));
}
async function searchDuckDuckGo(query) {
  const url = `https://api.duckduckgo.com/?${new URLSearchParams({
    q: query,
    format: "json",
    no_html: "1",
    skip_disambig: "1",
  })}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8e3),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const hits = [];
  if (data.AbstractText?.trim()) {
    hits.push({
      title: data.Heading || query,
      snippet: data.AbstractText,
      url: data.AbstractURL || "https://duckduckgo.com/",
    });
  }
  for (const topic of (data.RelatedTopics ?? []).slice(0, 3)) {
    if (topic.Text?.trim()) {
      hits.push({
        title: topic.Text.split(" - ")[0] ?? topic.Text.slice(0, 80),
        snippet: topic.Text,
        url: topic.FirstURL || "https://duckduckgo.com/",
      });
    }
  }
  return hits;
}
async function searchWeb(query) {
  const q = query.trim().slice(0, 200);
  if (!q) return "Consulta vacía.";
  try {
    const [wiki, ddg] = await Promise.all([
      searchWikipedia(q),
      searchDuckDuckGo(q),
    ]);
    const seen = /* @__PURE__ */ new Set();
    const merged = [];
    for (const hit of [...wiki, ...ddg]) {
      const key = hit.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }
    if (merged.length === 0) {
      return `No se encontraron resultados claros para "${q}". Sugiere al usuario reformular o consultar fuentes académicas oficiales.`;
    }
    return merged
      .slice(0, 5)
      .map(
        (h, i) => `${i + 1}. ${h.title}
   ${h.snippet.slice(0, MAX_SNIPPET)}
   Fuente: ${h.url}`,
      )
      .join("\n\n");
  } catch {
    return `Error al buscar "${q}". Responde con lo que sepas e indica que no pudiste verificar en internet.`;
  }
}
function messageNeedsWebHint(message) {
  return /\b(hoy|actualidad|noticia|202[4-9]|qui[eé]n\s+es\s+el\s+presidente|precio\s+del|clima|ultim[oa]s?\s+noticias|qu[eé]\s+pas[oó]|guerra|conflicto|elecci[oó]n)\b/i.test(
    message,
  );
}
const bodySchema = z.object({
  thread_id: z.string().uuid(),
  message: z.string().min(1).max(8e3),
});
const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const DEFAULT_SUPABASE_URL = "https://dbbgrvvpnevxfoexqezs.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_1ttTeFTd0vmorjPGwhYlKg_ehXypSMZ";
const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : "";
        if (!token) return jsonResponse({ error: "No autenticado" }, 401);
        const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const SUPABASE_KEY =
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          DEFAULT_SUPABASE_PUBLISHABLE_KEY;
        const supabase2 = createClient(SUPABASE_URL, SUPABASE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } =
          await supabase2.auth.getUser();
        if (userErr || !userData.user) {
          return jsonResponse({ error: "Sesión inválida" }, 401);
        }
        const userId = userData.user.id;
        let payload;
        try {
          payload = bodySchema.parse(await request.json());
        } catch (err) {
          return jsonResponse(
            {
              error:
                err instanceof z.ZodError
                  ? err.errors[0]?.message
                  : "Cuerpo inválido",
            },
            400,
          );
        }
        const inputMod = moderateUserInput(payload.message);
        if (!inputMod.allowed) {
          return jsonResponse({ content: inputMod.userMessage });
        }
        const { data: thread, error: thErr } = await supabase2
          .from("chat_threads")
          .select("id, user_id")
          .eq("id", payload.thread_id)
          .maybeSingle();
        if (thErr || !thread || thread.user_id !== userId) {
          return jsonResponse({ error: "Hilo no encontrado" }, 404);
        }
        const { data: history } = await supabase2
          .from("chat_messages")
          .select("role, content")
          .eq("thread_id", payload.thread_id)
          .order("created_at", { ascending: true })
          .limit(30);
        const { error: insErr } = await supabase2.from("chat_messages").insert({
          thread_id: payload.thread_id,
          role: "user",
          content: payload.message,
        });
        if (insErr) {
          return jsonResponse({ error: "No se pudo guardar el mensaje" }, 500);
        }
        const [platformData, webPrefetch] = await Promise.all([
          fetchPlatformContext(supabase2),
          messageNeedsWebHint(payload.message)
            ? searchWeb(payload.message.slice(0, 120))
            : Promise.resolve(null),
        ]);
        let systemPrompt = buildFullSystemPrompt(platformData);
        if (webPrefetch) {
          systemPrompt += `

### Búsqueda web previa
${webPrefetch}`;
        }
        const chatHistory = (history ?? [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));
        try {
          const result = await generateText({
            model: mistral(MISTRAL_CHAT_MODEL),
            system: systemPrompt,
            messages: [
              ...chatHistory,
              { role: "user", content: payload.message },
            ],
            tools: {
              search_web: tool({
                description:
                  "Busca en internet (Wikipedia + DuckDuckGo). Para actualidad o verificar hechos.",
                inputSchema: z.object({
                  query: z.string().describe("Consulta en español"),
                }),
                execute: async ({ query }) => searchWeb(query),
              }),
            },
            stopWhen: stepCountIs(4),
            temperature: 0.6,
            abortSignal: AbortSignal.timeout(45e3),
          });
          let content = result.text.trim();
          if (!content) {
            content =
              "No pude generar una respuesta clara. ¿Puedes reformular tu pregunta?";
          }
          const outputMod = moderateAssistantOutput(content);
          if (!outputMod.allowed) {
            content = outputMod.userMessage;
          }
          await supabase2.from("chat_messages").insert({
            thread_id: payload.thread_id,
            role: "assistant",
            content,
          });
          await supabase2
            .from("chat_threads")
            .update({ updated_at: /* @__PURE__ */ new Date().toISOString() })
            .eq("id", payload.thread_id);
          return jsonResponse({ content });
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            return jsonResponse({ error: "La IA tardó demasiado (45s)." }, 504);
          }
          const message = e instanceof Error ? e.message : "Error desconocido";
          if (message.includes("429")) {
            return jsonResponse(
              { error: "Demasiadas solicitudes a Mistral." },
              429,
            );
          }
          if (message.includes("401") || message.includes("Unauthorized")) {
            return jsonResponse({ error: "Clave de Mistral inválida." }, 500);
          }
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
const RegisterRoute = Route$c.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$d,
});
const RankingRoute = Route$b.update({
  id: "/ranking",
  path: "/ranking",
  getParentRoute: () => Route$d,
});
const NewRoute = Route$a.update({
  id: "/new",
  path: "/new",
  getParentRoute: () => Route$d,
});
const LoginRoute = Route$9.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$d,
});
const FeedRoute = Route$8.update({
  id: "/feed",
  path: "/feed",
  getParentRoute: () => Route$d,
});
const ChatRoute = Route$7.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => Route$d,
});
const BibliotecaRoute = Route$6.update({
  id: "/biblioteca",
  path: "/biblioteca",
  getParentRoute: () => Route$d,
});
const AdminRoute = Route$5.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$d,
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$d,
});
const ProfileDniRoute = Route$3.update({
  id: "/profile/$dni",
  path: "/profile/$dni",
  getParentRoute: () => Route$d,
});
const PostIdRoute = Route$2.update({
  id: "/post/$id",
  path: "/post/$id",
  getParentRoute: () => Route$d,
});
const BibliotecaSubirRoute = Route$1.update({
  id: "/subir",
  path: "/subir",
  getParentRoute: () => BibliotecaRoute,
});
const ApiChatRoute = Route.update({
  id: "/api/chat",
  path: "/api/chat",
  getParentRoute: () => Route$d,
});
const BibliotecaRouteChildren = {
  BibliotecaSubirRoute,
};
const BibliotecaRouteWithChildren = BibliotecaRoute._addFileChildren(
  BibliotecaRouteChildren,
);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  BibliotecaRoute: BibliotecaRouteWithChildren,
  ChatRoute,
  FeedRoute,
  LoginRoute,
  NewRoute,
  RankingRoute,
  RegisterRoute,
  ApiChatRoute,
  PostIdRoute,
  ProfileDniRoute,
};
const routeTree = Route$d._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", {
    className:
      "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ jsx("div", {
          className:
            "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10",
          children: /* @__PURE__ */ jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-8 w-8 text-destructive",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /* @__PURE__ */ jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
            }),
          }),
        }),
        /* @__PURE__ */ jsx("h1", {
          className: "text-2xl font-bold tracking-tight text-foreground",
          children: "Something went wrong",
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "An unexpected error occurred. Please try again.",
        }),
        false,
        /* @__PURE__ */ jsxs("div", {
          className: "mt-6 flex items-center justify-center gap-3",
          children: [
            /* @__PURE__ */ jsx("button", {
              onClick: () => {
                router2.invalidate();
                reset();
              },
              className:
                "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Try again",
            }),
            /* @__PURE__ */ jsx("a", {
              href: "/",
              className:
                "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Go home",
            }),
          ],
        }),
      ],
    }),
  });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      getRouter,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
export { Route$3 as R, Route$2 as a, colegio as c, router as r, useAuth as u };
