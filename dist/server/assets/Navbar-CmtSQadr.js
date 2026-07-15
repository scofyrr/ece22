import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { b as signOut } from "./auth-CQiZqu43.js";
import { GraduationCap, Rss, BookMarked, Trophy, MessageCircle, PenSquare, ShieldCheck, LogOut } from "lucide-react";
function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };
  const links = [
    { to: "/feed", label: "Feed", icon: Rss },
    { to: "/biblioteca", label: "Biblioteca", icon: BookMarked },
    { to: "/ranking", label: "Ranking", icon: Trophy },
    { to: "/chat", label: "Chat IA", icon: MessageCircle }
  ];
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b-2 border-ink bg-paper/85 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          whileHover: { rotate: -8, scale: 1.05 },
          className: "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]",
          children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "font-display text-xl font-extrabold leading-none", children: [
        "JCM",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-1 md:flex", children: [
      links.map(({ to, label, icon: Icon }) => /* @__PURE__ */ jsxs(
        Link,
        {
          to,
          className: "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-muted",
          activeProps: { className: "bg-muted" },
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
            " ",
            label
          ]
        },
        to
      )),
      isAdmin && /* @__PURE__ */ jsx(Link, { to: "/admin", className: "rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-muted", children: "Admin" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: user && profile ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Link, { to: "/new", className: "neo-btn hidden items-center gap-1.5 rounded-lg bg-lemon px-3 py-1.5 text-sm font-bold text-ink sm:inline-flex", children: [
        /* @__PURE__ */ jsx(PenSquare, { className: "h-4 w-4" }),
        " Publicar"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/profile/$dni", params: { dni: profile.dni }, className: "flex items-center gap-2 rounded-lg border-2 border-ink bg-card px-2 py-1 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] hover:bg-muted", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-coral text-xs font-extrabold text-white", children: profile.full_name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxs("span", { className: "chip ml-1 bg-lemon", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-3 w-3" }),
          " ",
          profile.points
        ] }),
        isAdmin && /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: handleLogout, className: "rounded-md p-2 hover:bg-muted", "aria-label": "Salir", children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "rounded-md px-3 py-1.5 text-sm font-bold hover:bg-muted", children: "Entrar" }),
      /* @__PURE__ */ jsx(Link, { to: "/register", className: "neo-btn rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground", children: "Crear cuenta" })
    ] }) })
  ] }) });
}
export {
  Navbar as N
};
