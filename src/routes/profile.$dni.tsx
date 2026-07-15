import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PostCard, { type PostCardData } from "@/components/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Trophy,
  Sparkles,
  BookOpen,
  Ban,
  UserCheck,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
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

export const Route = createFileRoute("/profile/$dni")({
  component: ProfilePage,
});

type Profile = {
  id: string;
  dni: string;
  full_name: string;
  grade: string;
  bio: string | null;
  points: number;
  level: number;
  created_at: string;
};

type Ban = { reason: string; until: string | null; active: boolean };

function ProfilePage() {
  const { dni } = Route.useParams();
  const { user, isTeacher } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [ban, setBan] = useState<Ban | null>(null);
  const [loading, setLoading] = useState(true);

  // Ban dialog state
  const [banOpen, setBanOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<
    "1d" | "2d" | "1w" | "1m" | "permanent"
  >("1d");
  const [banning, setBanning] = useState(false);

  const load = async () => {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("dni", dni)
      .maybeSingle();
    setProfile(p as Profile | null);
    if (p) {
      const [{ data: ps }, { data: bans }] = await Promise.all([
        supabase
          .from("posts")
          .select(
            `id, title, content, cover_image_url, created_at,
            author:profiles!posts_author_profile_fkey(dni, full_name, level),
            category:categories(name, emoji, slug),
            likes(count), comments(count)`,
          )
          .eq("author_id", (p as Profile).id)
          .order("created_at", { ascending: false }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("user_bans")
          .select("reason, until, active")
          .eq("user_id", (p as Profile).id)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPosts(
        ((ps ?? []) as any[]).map((x) => ({
          id: x.id,
          title: x.title,
          content: x.content,
          cover_image_url: x.cover_image_url,
          created_at: x.created_at,
          author: x.author,
          category: x.category,
          likes_count: x.likes?.[0]?.count ?? 0,
          comments_count: x.comments?.[0]?.count ?? 0,
        })),
      );
      const b = (bans ?? [])[0] as Ban | undefined;
      setBan(b && (!b.until || new Date(b.until) > new Date()) ? b : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [dni]);

  const applyBan = async () => {
    if (!profile || !reason.trim()) return toast.error("Escribe un motivo");
    setBanning(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("ban_user", {
      _user_id: profile.id,
      _reason: reason.trim(),
      _duration: duration,
    });
    setBanning(false);
    if (error) return toast.error(error.message);
    toast.success("Usuario baneado");
    setBanOpen(false);
    setReason("");
    load();
  };

  const unban = async () => {
    if (!profile) return;
    if (!confirm("¿Desbanear a este usuario?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("unban_user", {
      _user_id: profile.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Usuario desbaneado");
    load();
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-4xl p-8">
          <div className="neo-card h-48 animate-pulse" />
        </div>
      </div>
    );
  if (!profile)
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-4xl p-8">
          <p>Usuario no encontrado.</p>
        </div>
      </div>
    );

  const progress = Math.min(100, profile.points % 100);
  const canModerate = isTeacher && user?.id !== profile.id;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {ban && (
          <div className="neo-card mb-4 flex items-center gap-3 border-destructive bg-destructive/10 p-4">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <div className="flex-1">
              <p className="font-bold text-destructive">Usuario suspendido</p>
              <p className="text-sm">
                {ban.reason}{" "}
                {ban.until && (
                  <>· hasta {new Date(ban.until).toLocaleString("es")}</>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="neo-card p-6 md:p-8">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-ink bg-coral text-4xl font-extrabold text-white shadow-[6px_6px_0_0_var(--ink)]">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-extrabold md:text-4xl">
                {profile.full_name}
              </h1>
              <p className="text-muted-foreground">
                {profile.grade} · DNI {profile.dni}
              </p>
              {profile.bio && <p className="mt-2">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip bg-lemon">
                  <Trophy className="h-3.5 w-3.5" /> Nivel {profile.level}
                </span>
                <span className="chip bg-mint">
                  <Sparkles className="h-3.5 w-3.5" /> {profile.points} pts
                </span>
                <span className="chip bg-sky">
                  <BookOpen className="h-3.5 w-3.5" /> {posts.length}{" "}
                  publicaciones
                </span>
              </div>
            </div>
            {canModerate && (
              <div className="flex flex-col gap-2">
                <Link
                  to="/docentes/estudiante/$dni"
                  params={{ dni: profile.dni }}
                  className="neo-btn inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
                >
                  <BarChart3 className="h-4 w-4" /> Ver stats
                </Link>
                {ban ? (
                  <button
                    onClick={unban}
                    className="neo-btn inline-flex items-center gap-1 rounded-lg bg-mint px-3 py-2 text-sm font-bold text-ink"
                  >
                    <UserCheck className="h-4 w-4" /> Desbanear
                  </button>
                ) : (
                  <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
                    <AlertDialogTrigger asChild>
                      <button className="neo-btn inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground">
                        <Ban className="h-4 w-4" /> Banear
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Banear a {profile.full_name}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          El usuario no podrá publicar, comentar ni dar like
                          durante el período seleccionado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-bold">
                            Motivo
                          </label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Ej. Contenido inapropiado, insultos, spam..."
                            className="w-full rounded-lg border-2 border-ink bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-bold">
                            Duración
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                ["1d", "1 día"],
                                ["2d", "2 días"],
                                ["1w", "1 semana"],
                                ["1m", "1 mes"],
                                ["permanent", "Permanente"],
                              ] as const
                            ).map(([k, l]) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => setDuration(k)}
                                className={`rounded-md border-2 border-ink py-2 text-sm font-bold ${duration === k ? "bg-primary text-primary-foreground" : "bg-card"}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={banning}
                          onClick={applyBan}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {banning ? "Aplicando..." : "Aplicar baneo"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs font-bold">
              <span>Nivel {profile.level}</span>
              <span>
                {progress}/100 → Nivel {profile.level + 1}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-card">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <h2 className="mt-8 font-display text-2xl font-extrabold">
          Publicaciones
        </h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            Aún no ha publicado nada.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onDeleted={(id) =>
                  setPosts((xs) => xs.filter((x) => x.id !== id))
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
