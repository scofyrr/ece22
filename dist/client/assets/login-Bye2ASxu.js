import { r as a, u as g, j as e, L as c, t as n } from "./index-C-CdgMgA.js";
import { a as b } from "./auth-DVW7ohY8.js";
import { S as h } from "./sparkles-CP5ZMhoC.js";
import { o as j, s as d } from "./types-KBJzO2d1.js";
import "./createLucideIcon-Eusou0P7.js";
const y = j({
  dni: d().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos"),
  password: d().min(6, "Mínimo 6 caracteres"),
});
function k() {
  const [r, m] = a.useState(""),
    [t, u] = a.useState(""),
    [o, i] = a.useState(!1),
    x = g(),
    p = async (s) => {
      s.preventDefault();
      const l = y.safeParse({ dni: r, password: t });
      if (!l.success) {
        n.error(l.error.errors[0].message);
        return;
      }
      i(!0);
      const { error: f } = await b(r, t);
      if ((i(!1), f)) {
        n.error("DNI o contraseña incorrectos");
        return;
      }
      (n.success("¡Bienvenido de vuelta!"), x({ to: "/feed" }));
    };
  return e.jsx("div", {
    className: "flex min-h-screen items-center justify-center px-4 py-10",
    children: e.jsxs("div", {
      className: "neo-card w-full max-w-md p-8",
      children: [
        e.jsxs(c, {
          to: "/",
          className: "mb-6 flex items-center gap-2",
          children: [
            e.jsx("div", {
              className:
                "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground",
              children: e.jsx(h, { className: "h-5 w-5" }),
            }),
            e.jsx("span", {
              className: "font-display text-xl font-extrabold",
              children: "ECE",
            }),
          ],
        }),
        e.jsx("h1", {
          className: "font-display text-3xl font-extrabold",
          children: "Entrar",
        }),
        e.jsx("p", {
          className: "mt-1 text-sm text-muted-foreground",
          children: "Usa tu DNI para acceder a tu cuenta.",
        }),
        e.jsxs("form", {
          onSubmit: p,
          className: "mt-6 space-y-4",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: "DNI",
                }),
                e.jsx("input", {
                  inputMode: "numeric",
                  maxLength: 8,
                  value: r,
                  onChange: (s) => m(s.target.value.replace(/\D/g, "")),
                  placeholder: "12345678",
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 font-mono text-lg outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: "Contraseña",
                }),
                e.jsx("input", {
                  type: "password",
                  value: t,
                  onChange: (s) => u(s.target.value),
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            e.jsx("button", {
              disabled: o,
              className:
                "neo-btn w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50",
              children: o ? "Entrando..." : "Entrar",
            }),
          ],
        }),
        e.jsxs("p", {
          className: "mt-4 text-center text-sm",
          children: [
            "¿Aún no tienes cuenta?",
            " ",
            e.jsx(c, {
              to: "/register",
              className: "font-bold text-primary underline",
              children: "Regístrate",
            }),
          ],
        }),
      ],
    }),
  });
}
export { k as component };
