import MotionSection from "@/components/MotionSection";
import { Link } from "@tanstack/react-router";
import { colegio } from "@/content/colegio";

export default function CtaEntrarFeed() {
  return (
    <MotionSection className="mx-auto max-w-4xl px-4 py-24 text-center">
      <h2 className="font-display text-4xl font-extrabold md:text-5xl">{colegio.cta.titulo}</h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{colegio.cta.descripcion}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/feed" className="neo-btn rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground">
          {colegio.cta.boton}
        </Link>
        <Link to="/chat" className="neo-btn rounded-xl bg-mint px-8 py-4 text-lg font-bold text-ink">
          Hablar con la IA
        </Link>
      </div>
    </MotionSection>
  );
}
