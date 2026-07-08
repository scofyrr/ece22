import MotionSection from "@/components/MotionSection";
import { colegio } from "@/content/colegio";

export default function BioColegio() {
  return (
    <MotionSection className="mx-auto max-w-4xl px-4 py-20">
      <div className="neo-card p-8 md:p-12">
        <h2 className="font-display text-4xl font-extrabold">{colegio.bio.titulo}</h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
          {colegio.bio.parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
