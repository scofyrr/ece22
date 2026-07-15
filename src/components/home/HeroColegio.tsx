import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { colegio } from "@/content/colegio";
import { ChevronDown } from "lucide-react";

export default function HeroColegio() {
  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Bloom decorativo de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[8%] top-[18%] h-72 w-72 rounded-full bg-lemon/40 blur-3xl" />
        <div className="absolute left-[6%] bottom-[14%] h-80 w-80 rounded-full bg-coral/25 blur-3xl" />
        {/* Patrón andino sutil */}
        <div className="absolute inset-0 andino-pattern opacity-60" />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="chip bg-lemon glow-bloom"
      >
        🏔️ Huánuco · Comunidad educativa
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] md:text-7xl"
        style={{
          textShadow:
            "0 2px 30px color-mix(in oklab, var(--primary) 25%, transparent)",
        }}
      >
        {colegio.hero.titulo}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-3 font-display text-3xl font-extrabold text-primary md:text-4xl"
        style={{
          textShadow:
            "0 0 40px color-mix(in oklab, var(--primary) 40%, transparent)",
        }}
      >
        {colegio.hero.subtitulo}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-6 max-w-xl text-lg text-muted-foreground"
      >
        {colegio.hero.descripcion}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-10 flex flex-wrap justify-center gap-3"
      >
        <Link
          to="/feed"
          className="neo-btn rounded-xl bg-primary px-7 py-3 font-bold text-primary-foreground glow-bloom"
        >
          {colegio.cta.boton}
        </Link>
        <Link
          to="/biblioteca"
          className="neo-btn rounded-xl bg-card px-7 py-3 font-bold"
        >
          Biblioteca digital
        </Link>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8"
      >
        <ChevronDown className="h-7 w-7 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
