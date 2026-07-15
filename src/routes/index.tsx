import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeroColegio from "@/components/home/HeroColegio";
import BioColegio from "@/components/home/BioColegio";
import HistoriaColegio from "@/components/home/HistoriaColegio";
import ValoresColegio from "@/components/home/ValoresColegio";
import CtaEntrarFeed from "@/components/home/CtaEntrarFeed";
import { colegio } from "@/content/colegio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${colegio.nombre} "${colegio.apodo}"` },
      { name: "description", content: colegio.lema },
      { property: "og:title", content: `${colegio.nombre} "${colegio.apodo}"` },
      { property: "og:description", content: colegio.lema },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo difuminado con parallax al hacer scroll */}
      <ParallaxBackground src={colegio.fondoUrl} />
      <Navbar />
      <main>
        <HeroColegio />
        <BioColegio />
        <HistoriaColegio />
        <ValoresColegio />
        <CtaEntrarFeed />
      </main>
      <footer className="border-t-2 border-ink bg-ink py-8 text-center text-sm font-semibold text-paper">
        © {new Date().getFullYear()} {colegio.nombre} — "{colegio.apodo}"
      </footer>
    </div>
  );
}
