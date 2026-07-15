import MotionSection from "@/components/MotionSection";
import { motion } from "framer-motion";
import { colegio } from "@/content/colegio";

export default function ValoresColegio() {
  return (
    <MotionSection className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center font-display text-4xl font-extrabold">{colegio.valores.titulo}</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {colegio.valores.items.map((v, i) => (
          <motion.div
            key={v.nombre}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="neo-card p-6 text-center"
          >
            <div className="text-4xl">{v.emoji}</div>
            <h3 className="mt-3 font-display text-xl font-extrabold">{v.nombre}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </MotionSection>
  );
}
