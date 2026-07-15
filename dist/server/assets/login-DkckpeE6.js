import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { a as signInWithDni } from "./auth-CQiZqu43.js";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import "./client-DIhsBbtt.js";
import "@supabase/supabase-js";
const schema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      dni,
      password,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signInWithDni(dni, password);
    setLoading(false);
    if (error) {
      toast.error("DNI o contraseña incorrectos");
      return;
    }
    toast.success("¡Bienvenido de vuelta!");
    navigate({
      to: "/feed",
    });
  };
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center px-4 py-10",
    children: /* @__PURE__ */ jsxs("div", {
      className: "neo-card w-full max-w-md p-8",
      children: [
        /* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "mb-6 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsx("div", {
              className:
                "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground",
              children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" }),
            }),
            /* @__PURE__ */ jsx("span", {
              className: "font-display text-xl font-extrabold",
              children: "ECE",
            }),
          ],
        }),
        /* @__PURE__ */ jsx("h1", {
          className: "font-display text-3xl font-extrabold",
          children: "Entrar",
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-muted-foreground",
          children: "Usa tu DNI para acceder a tu cuenta.",
        }),
        /* @__PURE__ */ jsxs("form", {
          onSubmit: submit,
          className: "mt-6 space-y-4",
          children: [
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: "DNI",
                }),
                /* @__PURE__ */ jsx("input", {
                  inputMode: "numeric",
                  maxLength: 8,
                  value: dni,
                  onChange: (e) => setDni(e.target.value.replace(/\D/g, "")),
                  placeholder: "12345678",
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 font-mono text-lg outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: "Contraseña",
                }),
                /* @__PURE__ */ jsx("input", {
                  type: "password",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            /* @__PURE__ */ jsx("button", {
              disabled: loading,
              className:
                "neo-btn w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50",
              children: loading ? "Entrando..." : "Entrar",
            }),
          ],
        }),
        /* @__PURE__ */ jsxs("p", {
          className: "mt-4 text-center text-sm",
          children: [
            "¿Aún no tienes cuenta?",
            " ",
            /* @__PURE__ */ jsx(Link, {
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
export { LoginPage as component };
