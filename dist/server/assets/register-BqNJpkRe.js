import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { s as signUpWithDni } from "./auth-CQiZqu43.js";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import "./client-DIhsBbtt.js";
import "@supabase/supabase-js";
const schema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos"),
  full_name: z.string().trim().min(2, "Nombre muy corto").max(80),
  grade: z.string().trim().min(1, "Indica tu grado"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});
const GRADES = [
  "Primaria",
  "1° Secundaria",
  "2° Secundaria",
  "3° Secundaria",
  "4° Secundaria",
  "5° Secundaria",
  "Universidad",
  "Otro",
];
function RegisterPage() {
  const [dni, setDni] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState(GRADES[3]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      dni,
      full_name: fullName,
      grade,
      password,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUpWithDni({
      dni,
      password,
      full_name: fullName,
      grade,
    });
    setLoading(false);
    if (error) {
      const msg = error.message.includes("already")
        ? "Este DNI ya está registrado"
        : error.message.includes("rate limit")
          ? "Demasiados intentos seguidos. Espera un momento y vuelve a intentar."
          : error.message.includes("invalid")
            ? "No se pudo crear la cuenta. Revisa que el DNI tenga 8 dígitos."
            : error.message;
      toast.error(msg);
      return;
    }
    toast.success("¡Cuenta creada! Bienvenido a ECE 🎉");
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
          children: "Crear cuenta",
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-sm text-muted-foreground",
          children: "Solo necesitas tu DNI.",
        }),
        /* @__PURE__ */ jsxs("form", {
          onSubmit: submit,
          className: "mt-6 space-y-4",
          children: [
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsxs("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: [
                    "DNI ",
                    /* @__PURE__ */ jsx("span", {
                      className: "text-muted-foreground",
                      children: "(8 dígitos)",
                    }),
                  ],
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
                  children: "Nombre completo",
                }),
                /* @__PURE__ */ jsx("input", {
                  value: fullName,
                  onChange: (e) => setFullName(e.target.value),
                  placeholder: "Ej. Ana Pérez",
                  maxLength: 80,
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsx("label", {
                  className: "mb-1 block text-sm font-bold",
                  children: "Grado / nivel",
                }),
                /* @__PURE__ */ jsx("select", {
                  value: grade,
                  onChange: (e) => setGrade(e.target.value),
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                  children: GRADES.map((g) =>
                    /* @__PURE__ */ jsx("option", { value: g, children: g }, g),
                  ),
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
                  minLength: 6,
                  className:
                    "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary",
                }),
              ],
            }),
            /* @__PURE__ */ jsx("button", {
              disabled: loading,
              className:
                "neo-btn w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50",
              children: loading ? "Creando..." : "Crear cuenta",
            }),
          ],
        }),
        /* @__PURE__ */ jsxs("p", {
          className: "mt-4 text-center text-sm",
          children: [
            "¿Ya tienes cuenta?",
            " ",
            /* @__PURE__ */ jsx(Link, {
              to: "/login",
              className: "font-bold text-primary underline",
              children: "Entrar",
            }),
          ],
        }),
      ],
    }),
  });
}
export { RegisterPage as component };
