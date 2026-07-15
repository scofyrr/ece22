import {
  b as E,
  r as n,
  c as I,
  d as P,
  j as e,
  O as A,
  a as D,
  s as f,
  t as i,
} from "./index-C-CdgMgA.js";
import { N as S, m as L } from "./Navbar-BTC3bKq4.js";
import {
  B as T,
  a as q,
  C as v,
  U as k,
  v as M,
} from "./BookUploadForm-OOg83TbX.js";
import { B as _ } from "./book-open-CuNFelkm.js";
import { c as H } from "./createLucideIcon-Eusou0P7.js";
import "./auth-DVW7ohY8.js";
import "./types-KBJzO2d1.js";
function $(o) {
  const r = E({ warn: o?.router === void 0 }),
    l = o?.router || r,
    d = n.useRef(void 0);
  return I(l.stores.__store, (u) => {
    if (o?.select) {
      if (o.structuralSharing ?? l.options.defaultStructuralSharing) {
        const m = P(d.current, o.select(u));
        return ((d.current = m), m);
      }
      return o.select(u);
    }
    return u;
  });
}
const z = [
    ["path", { d: "M12 15V3", key: "m9g1x1" }],
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }],
  ],
  K = H("download", z);
function ee() {
  return $({ select: (l) => l.location.pathname }) === "/biblioteca/subir"
    ? e.jsxs("div", {
        className: "min-h-screen",
        children: [e.jsx(S, {}), e.jsx(A, {})],
      })
    : e.jsx(Q, {});
}
function Q() {
  const { user: o, profile: r, refreshProfile: l } = D(),
    [d, u] = n.useState([]),
    [m, h] = n.useState(new Set()),
    [C, g] = n.useState(!0),
    [B, p] = n.useState(null),
    [b, j] = n.useState(!1),
    [R, N] = n.useState(null),
    x = n.useRef(null),
    y = async () => {
      g(!0);
      const { data: s, error: t } = await f
        .from("books")
        .select(
          "id,title,author,description,cover_url,price_points,owner_id,pdf_path",
        )
        .order("created_at", { ascending: !1 });
      if (
        (t && (console.error(t), i.error("No se pudo cargar la biblioteca")),
        u(s ?? []),
        r)
      ) {
        const { data: a } = await f
          .from("book_purchases")
          .select("book_id")
          .eq("buyer_id", r.id);
        h(new Set((a ?? []).map((c) => c.book_id)));
      } else h(new Set());
      g(!1);
    };
  n.useEffect(() => {
    y();
  }, [r?.id]);
  const O = async (s) => {
      if (!r) {
        i.error("Inicia sesión para canjear");
        return;
      }
      const t = 20;
      if ((r.points ?? 0) < t) {
        i.error(`Te faltan ${t - (r.points ?? 0)} puntos`);
        return;
      }
      p(s.id);
      const { error: a } = await f.rpc("purchase_book", { _book_id: s.id });
      if ((p(null), a)) {
        i.error(a.message);
        return;
      }
      (i.success(`¡Canjeado! Ya puedes descargar "${s.title}" 📚`),
        await Promise.all([y(), l()]));
    },
    F = async (s) => {
      p(s.id);
      const { data: t, error: a } = await f.storage
        .from("book-pdfs")
        .createSignedUrl(s.pdf_path, 600);
      if ((p(null), a || !t?.signedUrl)) {
        i.error(a?.message ?? "No se pudo generar el enlace");
        return;
      }
      window.open(t.signedUrl, "_blank", "noopener,noreferrer");
    },
    w = () => {
      if (!o) {
        i.error("Inicia sesión para subir libros");
        return;
      }
      x.current?.click();
    },
    U = (s) => {
      if (!s) return;
      const t = M(s);
      if (!t.ok) {
        i.error(t.message);
        return;
      }
      (N(s), j(!0), x.current && (x.current.value = ""));
    };
  return e.jsxs("div", {
    className: "min-h-screen",
    children: [
      e.jsx(S, {}),
      e.jsx("input", {
        ref: x,
        type: "file",
        className: "hidden",
        accept: T,
        onChange: (s) => U(s.target.files?.[0] ?? null),
      }),
      b &&
        e.jsx(q, {
          asDialog: !0,
          open: b,
          initialFile: R,
          onClose: () => {
            (j(!1), N(null));
          },
        }),
      e.jsxs("main", {
        className: "mx-auto max-w-6xl px-4 py-8",
        children: [
          e.jsxs("div", {
            className:
              "mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h1", {
                    className: "font-display text-4xl font-extrabold",
                    children: "Biblioteca Digital",
                  }),
                  e.jsx("p", {
                    className: "text-muted-foreground",
                    children:
                      "Sube tus libros y canjea puntos por los de otros estudiantes.",
                  }),
                  r &&
                    e.jsxs("p", {
                      className:
                        "mt-2 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold",
                      children: [
                        e.jsx(v, { className: "h-4 w-4" }),
                        " Tienes ",
                        r.points,
                        " pts",
                      ],
                    }),
                ],
              }),
              e.jsxs("button", {
                type: "button",
                onClick: w,
                className:
                  "neo-btn inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground",
                children: [e.jsx(k, { className: "h-4 w-4" }), " Subir libro"],
              }),
            ],
          }),
          C
            ? e.jsx("div", {
                className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                children: [...Array(6)].map((s, t) =>
                  e.jsx("div", { className: "neo-card h-72 animate-pulse" }, t),
                ),
              })
            : d.length === 0
              ? e.jsxs("div", {
                  className: "neo-card p-10 text-center",
                  children: [
                    e.jsx(_, { className: "mx-auto h-10 w-10" }),
                    e.jsx("p", {
                      className: "mt-3 font-display text-2xl font-bold",
                      children: "Aún no hay libros.",
                    }),
                    e.jsx("p", {
                      className: "mt-1 text-muted-foreground",
                      children: "¡Sé el primero en compartir uno!",
                    }),
                    e.jsxs("button", {
                      type: "button",
                      onClick: w,
                      className:
                        "neo-btn mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-primary-foreground",
                      children: [
                        e.jsx(k, { className: "h-4 w-4" }),
                        " Subir el primero",
                      ],
                    }),
                  ],
                })
              : e.jsx("div", {
                  className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  children: d.map((s) => {
                    const t = m.has(s.id),
                      a = r?.id === s.owner_id,
                      c = B === s.id;
                    return e.jsxs(
                      L.div,
                      {
                        whileHover: { y: -6 },
                        className: "neo-card flex flex-col overflow-hidden",
                        children: [
                          e.jsx("div", {
                            className:
                              "aspect-[3/4] w-full overflow-hidden border-b-2 border-ink bg-muted",
                            children: s.cover_url
                              ? e.jsx("img", {
                                  src: s.cover_url,
                                  alt: s.title,
                                  className: "h-full w-full object-cover",
                                  loading: "lazy",
                                })
                              : e.jsx("div", {
                                  className:
                                    "flex h-full items-center justify-center",
                                  children: e.jsx(_, {
                                    className:
                                      "h-12 w-12 text-muted-foreground",
                                  }),
                                }),
                          }),
                          e.jsxs("div", {
                            className: "flex flex-1 flex-col p-4",
                            children: [
                              e.jsx("h3", {
                                className:
                                  "font-display text-lg font-extrabold leading-tight",
                                children: s.title,
                              }),
                              s.author &&
                                e.jsxs("p", {
                                  className: "text-xs text-muted-foreground",
                                  children: ["por ", s.author],
                                }),
                              s.description &&
                                e.jsx("p", {
                                  className:
                                    "mt-2 line-clamp-2 text-sm text-muted-foreground",
                                  children: s.description,
                                }),
                              e.jsxs("div", {
                                className:
                                  "mt-auto flex items-center justify-between pt-4",
                                children: [
                                  e.jsxs("span", {
                                    className: "chip bg-lemon",
                                    children: [
                                      e.jsx(v, { className: "h-3 w-3" }),
                                      " 20",
                                    ],
                                  }),
                                  a
                                    ? e.jsx("span", {
                                        className:
                                          "text-xs font-bold text-muted-foreground",
                                        children: "Tu libro",
                                      })
                                    : t
                                      ? e.jsxs("button", {
                                          onClick: () => F(s),
                                          disabled: c,
                                          className:
                                            "neo-btn inline-flex items-center gap-1 rounded-lg bg-mint px-3 py-1.5 text-sm font-bold text-ink disabled:opacity-50",
                                          children: [
                                            e.jsx(K, { className: "h-4 w-4" }),
                                            " ",
                                            c ? "Abriendo..." : "Leer",
                                          ],
                                        })
                                      : e.jsx("button", {
                                          onClick: () => O(s),
                                          disabled: c,
                                          className:
                                            "neo-btn rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-50",
                                          children: c
                                            ? "Canjeando..."
                                            : "Canjear",
                                        }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      s.id,
                    );
                  }),
                }),
        ],
      }),
    ],
  });
}
export { ee as component };
