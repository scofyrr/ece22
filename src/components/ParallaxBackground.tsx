import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Fondo difuminado que se desplaza suavemente a medida que haces scroll.
 * Úsalo dentro de un contenedor con `position: relative`.
 */
export default function ParallaxBackground({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        style={{ y, scale, backgroundImage: `url(${src})` }}
        className="absolute inset-0 bg-cover bg-center blur-2xl brightness-[0.85]"
      />
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}
