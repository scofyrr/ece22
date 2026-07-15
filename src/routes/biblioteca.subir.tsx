import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { BookUploadForm } from "@/components/library/BookUploadForm";
import { Coins } from "lucide-react";
import { UPLOAD_FEE } from "@/lib/book-upload.constants";

export const Route = createFileRoute("/biblioteca/subir")({
  head: () => ({ meta: [{ title: "Subir libro — Biblioteca JCM" }] }),
  component: SubirLibroPage,
});

function SubirLibroPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/login" }); }, [authLoading, user, navigate]);
  useEffect(() => { if (user) void refreshProfile(); }, [user, refreshProfile]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-4xl font-extrabold">Subir un libro</h1>
      <p className="text-muted-foreground">
        Cuesta <b>{UPLOAD_FEE} puntos</b> publicar. Otros pagan <b>20 pts</b> para descargarlo (100% para ti).
      </p>
      {profile && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold">
          <Coins className="h-4 w-4" /> Tienes {profile.points} pts
        </p>
      )}
      <div className="neo-card mt-6 p-6">
        <BookUploadForm />
      </div>
    </main>
  );
}
