import { a as n, u as l, r as i, j as s } from "./index-C-CdgMgA.js";
import { b as p, C as m, a as c } from "./BookUploadForm-OOg83TbX.js";
import "./createLucideIcon-Eusou0P7.js";
import "./types-KBJzO2d1.js";
function b() {
  const { user: e, profile: a, loading: r, refreshProfile: o } = n(),
    t = l();
  return (
    i.useEffect(() => {
      !r && !e && t({ to: "/login" });
    }, [r, e, t]),
    i.useEffect(() => {
      e && o();
    }, [e, o]),
    s.jsxs("main", {
      className: "mx-auto max-w-2xl px-4 py-8",
      children: [
        s.jsx("h1", {
          className: "font-display text-4xl font-extrabold",
          children: "Subir un libro",
        }),
        s.jsxs("p", {
          className: "text-muted-foreground",
          children: [
            "Cuesta ",
            s.jsxs("b", { children: [p, " puntos"] }),
            " publicar. Otros pagan ",
            s.jsx("b", { children: "20 pts" }),
            " para descargarlo (100% para ti).",
          ],
        }),
        a &&
          s.jsxs("p", {
            className:
              "mt-2 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold",
            children: [
              s.jsx(m, { className: "h-4 w-4" }),
              " Tienes ",
              a.points,
              " pts",
            ],
          }),
        s.jsx("div", {
          className: "neo-card mt-6 p-6",
          children: s.jsx(c, {}),
        }),
      ],
    })
  );
}
export { b as component };
