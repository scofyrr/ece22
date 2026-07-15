import MotionSection from "@/components/MotionSection";
import { colegio } from "@/content/colegio";

export default function HistoriaColegio() {
  return (
    <MotionSection className="mx-auto max-w-4xl px-4 py-20">
      <h2 className="text-center font-display text-4xl font-extrabold">{colegio.historia.titulo}</h2>
      <div className="mt-10 space-y-6">
        {colegio.historia.hitos.map((h, i) => (
          <div key={i} className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lemon font-display text-sm font-extrabold shadow-[3px_3px_0_0_var(--ink)]">
              {h.anio}
            </div>
            <div className="neo-card flex-1 p-5">
              <p className="text-muted-foreground">{h.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </MotionSection>
  );
}
