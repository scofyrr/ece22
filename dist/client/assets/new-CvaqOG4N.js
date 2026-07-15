import {
  a as k,
  u as w,
  r as a,
  s as f,
  j as e,
  t as i,
} from "./index-C-CdgMgA.js";
import { N as S } from "./Navbar-BTC3bKq4.js";
import { o as E, s as o, l as P } from "./types-KBJzO2d1.js";
import "./auth-DVW7ohY8.js";
import "./createLucideIcon-Eusou0P7.js";
const T = E({
  title: o().trim().min(3, "Título muy corto").max(200),
  content: o()
    .trim()
    .min(10, "Cuéntanos un poco más (mín. 10 caracteres)")
    .max(2e4),
  category_id: o().uuid("Elige una categoría"),
  cover_image_url: o().url().or(P("")).optional(),
});
function z() {
  const { user: s, loading: c } = k(),
    n = w(),
    [h, j] = a.useState([]),
    [u, y] = a.useState(""),
    [l, v] = a.useState(""),
    [d, m] = a.useState(""),
    [g, N] = a.useState(""),
    [p, x] = a.useState(!1);
  (a.useEffect(() => {
    !c && !s && n({ to: "/login" });
  }, [c, s, n]),
    a.useEffect(() => {
      f.from("categories")
        .select("id,name,emoji")
        .order("name")
        .then(({ data: t }) => {
          (j(t ?? []), t && t.length && m(t[0].id));
        });
    }, []));
  const C = async (t) => {
    if ((t.preventDefault(), !s)) return;
    const r = T.safeParse({
      title: u,
      content: l,
      category_id: d,
      cover_image_url: g,
    });
    if (!r.success) {
      i.error(r.error.errors[0].message);
      return;
    }
    x(!0);
    const { data: _, error: b } = await f
      .from("posts")
      .insert({
        author_id: s.id,
        title: r.data.title,
        content: r.data.content,
        category_id: r.data.category_id,
        cover_image_url: r.data.cover_image_url || null,
      })
      .select("id")
      .single();
    if ((x(!1), b)) {
      i.error(b.message);
      return;
    }
    (i.success("¡Publicado! +10 puntos 🎉"),
      n({ to: "/post/$id", params: { id: _.id } }));
  };
  return e.jsxs("div", {
    className: "min-h-screen",
    children: [
      e.jsx(S, {}),
      e.jsxs("main", {
        className: "mx-auto max-w-3xl px-4 py-8",
        children: [
          e.jsx("h1", {
            className: "font-display text-4xl font-extrabold",
            children: "Comparte lo que sabes",
          }),
          e.jsx("p", {
            className: "text-muted-foreground",
            children:
              "Cualquier aporte cuenta — un truco, un consejo o una explicación.",
          }),
          e.jsxs("form", {
            onSubmit: C,
            className: "neo-card mt-6 space-y-5 p-6",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("label", {
                    className: "mb-1 block text-sm font-bold",
                    children: "Título",
                  }),
                  e.jsx("input", {
                    value: u,
                    onChange: (t) => y(t.target.value),
                    maxLength: 200,
                    placeholder: "Ej. Cómo memorizar fórmulas trigonométricas",
                    className:
                      "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("label", {
                    className: "mb-1 block text-sm font-bold",
                    children: "Categoría",
                  }),
                  e.jsx("select", {
                    value: d,
                    onChange: (t) => m(t.target.value),
                    className:
                      "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                    children: h.map((t) =>
                      e.jsxs(
                        "option",
                        { value: t.id, children: [t.emoji, " ", t.name] },
                        t.id,
                      ),
                    ),
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsxs("label", {
                    className: "mb-1 block text-sm font-bold",
                    children: [
                      "Imagen de portada ",
                      e.jsx("span", {
                        className: "text-muted-foreground",
                        children: "(URL opcional)",
                      }),
                    ],
                  }),
                  e.jsx("input", {
                    value: g,
                    onChange: (t) => N(t.target.value),
                    placeholder: "https://...",
                    className:
                      "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("label", {
                    className: "mb-1 block text-sm font-bold",
                    children: "Contenido",
                  }),
                  e.jsx("textarea", {
                    value: l,
                    onChange: (t) => v(t.target.value),
                    rows: 12,
                    maxLength: 2e4,
                    placeholder: "Explica con tus palabras…",
                    className:
                      "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                  }),
                  e.jsxs("p", {
                    className: "mt-1 text-right text-xs text-muted-foreground",
                    children: [l.length, "/20000"],
                  }),
                ],
              }),
              e.jsx("button", {
                disabled: p,
                className:
                  "neo-btn rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50",
                children: p ? "Publicando..." : "Publicar",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { z as component };
