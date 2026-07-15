import { jsxs, jsx } from "react/jsx-runtime";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { c as colegio } from "./router-BQQ5DE_J.js";
import { ChevronDown } from "lucide-react";
import "./auth-CQiZqu43.js";
import "./client-DIhsBbtt.js";
import "@supabase/supabase-js";
import "sonner";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function ParallaxBackground({ src }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);
  return /* @__PURE__ */ jsxs("div", { ref, className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        style: { y, scale, backgroundImage: `url(${src})` },
        className: "absolute inset-0 bg-cover bg-center blur-2xl brightness-[0.85]"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background/70" })
  ] });
}
function HeroColegio() {
  return /* @__PURE__ */ jsxs("section", { className: "relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 text-center", children: [
    /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute right-[8%] top-[18%] h-72 w-72 rounded-full bg-lemon/40 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute left-[6%] bottom-[14%] h-80 w-80 rounded-full bg-coral/25 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 andino-pattern opacity-60" })
    ] }),
    /* @__PURE__ */ jsx(
      motion.span,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
        className: "chip bg-lemon glow-bloom",
        children: "🏔️ Huánuco · Comunidad educativa"
      }
    ),
    /* @__PURE__ */ jsx(
      motion.h1,
      {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.1 },
        className: "mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] md:text-7xl",
        style: { textShadow: "0 2px 30px color-mix(in oklab, var(--primary) 25%, transparent)" },
        children: colegio.hero.titulo
      }
    ),
    /* @__PURE__ */ jsx(
      motion.p,
      {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.2 },
        className: "mt-3 font-display text-3xl font-extrabold text-primary md:text-4xl",
        style: { textShadow: "0 0 40px color-mix(in oklab, var(--primary) 40%, transparent)" },
        children: colegio.hero.subtitulo
      }
    ),
    /* @__PURE__ */ jsx(
      motion.p,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.7, delay: 0.35 },
        className: "mt-6 max-w-xl text-lg text-muted-foreground",
        children: colegio.hero.descripcion
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.5 },
        className: "mt-10 flex flex-wrap justify-center gap-3",
        children: [
          /* @__PURE__ */ jsx(Link, { to: "/feed", className: "neo-btn rounded-xl bg-primary px-7 py-3 font-bold text-primary-foreground glow-bloom", children: colegio.cta.boton }),
          /* @__PURE__ */ jsx(Link, { to: "/biblioteca", className: "neo-btn rounded-xl bg-card px-7 py-3 font-bold", children: "Biblioteca digital" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        animate: { y: [0, 10, 0] },
        transition: { repeat: Infinity, duration: 2 },
        className: "absolute bottom-8",
        children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-7 w-7 text-muted-foreground" })
      }
    )
  ] });
}
function MotionSection({
  children,
  className,
  delay = 0
}) {
  return /* @__PURE__ */ jsx(
    motion.section,
    {
      initial: { opacity: 0, y: 40 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" },
      transition: { duration: 0.6, ease: "easeOut", delay },
      className,
      children
    }
  );
}
function BioColegio() {
  return /* @__PURE__ */ jsx(MotionSection, { className: "mx-auto max-w-4xl px-4 py-20", children: /* @__PURE__ */ jsxs("div", { className: "neo-card p-8 md:p-12", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-display text-4xl font-extrabold", children: colegio.bio.titulo }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground", children: colegio.bio.parrafos.map((p, i) => /* @__PURE__ */ jsx("p", { children: p }, i)) })
  ] }) });
}
function HistoriaColegio() {
  return /* @__PURE__ */ jsxs(MotionSection, { className: "mx-auto max-w-4xl px-4 py-20", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-center font-display text-4xl font-extrabold", children: colegio.historia.titulo }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 space-y-6", children: colegio.historia.hitos.map((h, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lemon font-display text-sm font-extrabold shadow-[3px_3px_0_0_var(--ink)]", children: h.anio }),
      /* @__PURE__ */ jsx("div", { className: "neo-card flex-1 p-5", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: h.texto }) })
    ] }, i)) })
  ] });
}
function ValoresColegio() {
  return /* @__PURE__ */ jsxs(MotionSection, { className: "mx-auto max-w-6xl px-4 py-20", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-center font-display text-4xl font-extrabold", children: colegio.valores.titulo }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: colegio.valores.items.map((v, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5, delay: i * 0.1 },
        whileHover: { y: -6 },
        className: "neo-card p-6 text-center",
        children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl", children: v.emoji }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 font-display text-xl font-extrabold", children: v.nombre }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: v.desc })
        ]
      },
      v.nombre
    )) })
  ] });
}
function CtaEntrarFeed() {
  return /* @__PURE__ */ jsxs(MotionSection, { className: "mx-auto max-w-4xl px-4 py-24 text-center", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-display text-4xl font-extrabold md:text-5xl", children: colegio.cta.titulo }),
    /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-xl text-lg text-muted-foreground", children: colegio.cta.descripcion }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/feed", className: "neo-btn rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground", children: colegio.cta.boton }),
      /* @__PURE__ */ jsx(Link, { to: "/chat", className: "neo-btn rounded-xl bg-mint px-8 py-4 text-lg font-bold text-ink", children: "Hablar con la IA" })
    ] })
  ] });
}
function Landing() {
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen", children: [
    /* @__PURE__ */ jsx(ParallaxBackground, { src: colegio.fondoUrl }),
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx(HeroColegio, {}),
      /* @__PURE__ */ jsx(BioColegio, {}),
      /* @__PURE__ */ jsx(HistoriaColegio, {}),
      /* @__PURE__ */ jsx(ValoresColegio, {}),
      /* @__PURE__ */ jsx(CtaEntrarFeed, {})
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "border-t-2 border-ink bg-ink py-8 text-center text-sm font-semibold text-paper", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ",
      colegio.nombre,
      ' — "',
      colegio.apodo,
      '"'
    ] })
  ] });
}
export {
  Landing as component
};
