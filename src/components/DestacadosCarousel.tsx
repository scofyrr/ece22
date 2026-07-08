import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export type DestacadoItem = {
  id: string;
  title: string;
  cover_image_url: string | null;
  author?: { full_name: string; dni: string } | null;
  category?: { name: string; emoji: string } | null;
};

export default function DestacadosCarousel({ items }: { items: DestacadoItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-extrabold">Destacados</h2>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {items.map((p) => (
          <Link
            key={p.id}
            to="/post/$id"
            params={{ id: p.id }}
            className="neo-card group relative w-64 shrink-0 snap-start overflow-hidden"
          >
            <div
              className="h-32 w-full bg-cover bg-center"
              style={{
                backgroundImage: p.cover_image_url
                  ? `url(${p.cover_image_url})`
                  : "linear-gradient(135deg, color-mix(in oklab, var(--primary) 30%, transparent), color-mix(in oklab, var(--coral) 25%, transparent))",
              }}
            />
            <div className="p-3">
              {p.category && (
                <span className="chip mb-2 bg-lemon text-xs">
                  {p.category.emoji} {p.category.name}
                </span>
              )}
              <h3 className="line-clamp-2 font-display text-sm font-extrabold">{p.title}</h3>
              {p.author && (
                <p className="mt-1 truncate text-xs text-muted-foreground">por {p.author.full_name}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
