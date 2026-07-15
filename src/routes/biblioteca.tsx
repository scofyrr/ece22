import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, Coins, Upload, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookUploadForm } from "@/components/library/BookUploadForm";
import {
  BOOK_FILE_ACCEPT,
  validateBookFile,
} from "@/lib/book-upload.constants";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Digital — JCM" },
      {
        name: "description",
        content: "Canjea tus puntos por libros que la comunidad sube.",
      },
    ],
  }),
  component: BibliotecaPage,
});

type Book = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  price_points: number;
  owner_id: string;
  pdf_path: string;
};

function BibliotecaPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSubirRoute = pathname === "/biblioteca/subir";

  if (isSubirRoute) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Outlet />
      </div>
    );
  }

  return <BibliotecaCatalog />;
}

function BibliotecaCatalog() {
  const { user, profile, isTeacher, refreshProfile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const quickFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select(
        "id,title,author,description,cover_url,price_points,owner_id,pdf_path",
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("No se pudo cargar la biblioteca");
    }
    setBooks((data ?? []) as Book[]);
    if (profile) {
      const { data: p } = await supabase
        .from("book_purchases")
        .select("book_id")
        .eq("buyer_id", profile.id);
      setOwned(new Set((p ?? []).map((r) => r.book_id)));
    } else {
      setOwned(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const buy = async (book: Book) => {
    if (!profile) {
      toast.error("Inicia sesión para canjear");
      return;
    }
    const PRICE = 20;
    if ((profile.points ?? 0) < PRICE) {
      toast.error(`Te faltan ${PRICE - (profile.points ?? 0)} puntos`);
      return;
    }
    setBusyId(book.id);
    const { error } = await supabase.rpc("purchase_book", {
      _book_id: book.id,
    });
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`¡Canjeado! Ya puedes descargar "${book.title}" 📚`);
    await Promise.all([load(), refreshProfile()]);
  };

  const download = async (book: Book) => {
    setBusyId(book.id);
    const { data, error } = await supabase.storage
      .from("book-pdfs")
      .createSignedUrl(book.pdf_path, 60 * 10);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "No se pudo generar el enlace");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const openUploadPicker = () => {
    if (!user) {
      toast.error("Inicia sesión para subir libros");
      return;
    }
    quickFileRef.current?.click();
  };

  const onQuickFile = (f: File | null) => {
    if (!f) return;
    const check = validateBookFile(f);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setPickedFile(f);
    setUploadOpen(true);
    if (quickFileRef.current) quickFileRef.current.value = "";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <input
        ref={quickFileRef}
        type="file"
        className="hidden"
        accept={BOOK_FILE_ACCEPT}
        onChange={(e) => onQuickFile(e.target.files?.[0] ?? null)}
      />

      {uploadOpen && (
        <BookUploadForm
          asDialog
          open={uploadOpen}
          initialFile={pickedFile}
          onClose={() => {
            setUploadOpen(false);
            setPickedFile(null);
          }}
        />
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-extrabold">
              Biblioteca Digital
            </h1>
            <p className="text-muted-foreground">
              Sube tus libros y canjea puntos por los de otros estudiantes.
            </p>
            {profile && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold">
                <Coins className="h-4 w-4" /> Tienes {profile.points} pts
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openUploadPicker}
            className="neo-btn inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
          >
            <Upload className="h-4 w-4" /> Subir libro
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="neo-card h-72 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="neo-card p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10" />
            <p className="mt-3 font-display text-2xl font-bold">
              Aún no hay libros.
            </p>
            <p className="mt-1 text-muted-foreground">
              ¡Sé el primero en compartir uno!
            </p>
            <button
              type="button"
              onClick={openUploadPicker}
              className="neo-btn mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Subir el primero
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => {
              const isOwned = owned.has(b.id);
              const isMine = profile?.id === b.owner_id;
              const isBusy = busyId === b.id;
              return (
                <motion.div
                  key={b.id}
                  whileHover={{ y: -6 }}
                  className="neo-card relative flex flex-col overflow-hidden"
                >
                  {isTeacher && !isMine && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          aria-label="Eliminar libro"
                          className="neo-btn absolute right-2 top-2 z-10 rounded-full bg-destructive p-2 text-destructive-foreground shadow-md hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar este libro?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            "{b.title}" se eliminará permanentemente de la
                            biblioteca.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              const { error } = await supabase
                                .from("books")
                                .delete()
                                .eq("id", b.id);
                              if (error) return toast.error(error.message);
                              toast.success("Libro eliminado");
                              load();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <div className="aspect-[3/4] w-full overflow-hidden border-b-2 border-ink bg-muted">
                    {b.cover_url ? (
                      <img
                        src={b.cover_url}
                        alt={b.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-extrabold leading-tight">
                      {b.title}
                    </h3>
                    {b.author && (
                      <p className="text-xs text-muted-foreground">
                        por {b.author}
                      </p>
                    )}
                    {b.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {b.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="chip bg-lemon">
                        <Coins className="h-3 w-3" /> 20
                      </span>
                      {isMine ? (
                        <span className="text-xs font-bold text-muted-foreground">
                          Tu libro
                        </span>
                      ) : isOwned ? (
                        <button
                          onClick={() => download(b)}
                          disabled={isBusy}
                          className="neo-btn inline-flex items-center gap-1 rounded-lg bg-mint px-3 py-1.5 text-sm font-bold text-ink disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />{" "}
                          {isBusy ? "Abriendo..." : "Leer"}
                        </button>
                      ) : (
                        <button
                          onClick={() => buy(b)}
                          disabled={isBusy}
                          className="neo-btn rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
                        >
                          {isBusy ? "Canjeando..." : "Canjear"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
