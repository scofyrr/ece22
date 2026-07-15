import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft, Ban, UserCheck, Trash2, Terminal, Heart, MessageCircle, FileText,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUserAccount } from "@/lib/teacher.functions";

export const Route = createFileRoute("/docentes/estudiante/$dni")({
  component: StudentDetail,
});

type Profile = { id: string; dni: string; full_name: string; grade: string; points: number; level: number };
type Activity =
  | { kind: "post"; id: string; text: string; created_at: string; extra?: string }
  | { kind: "comment"; id: string; text: string; created_at: string; extra?: string }
  | { kind: "like"; id: string; text: string; created_at: string };

function StudentDetail() {
  const { dni } = Route.useParams();
  const { isTeacher, loading, user } = useAuth();
  const navigate = useNavigate();
  const delAcc = useServerFn(deleteUserAccount);

  const [p, setP] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [cats, setCats] = useState<{ name: string; color: string; count: number }[]>([]);
  const [views, setViews] = useState<{ day: string; count: number }[]>([]);
  const [ban, setBan] = useState<{ reason: string; until: string | null } | null>(null);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<"1d" | "2d" | "1w" | "1m" | "permanent">("1d");

  useEffect(() => {
    if (!loading && !isTeacher) navigate({ to: "/" });
  }, [loading, isTeacher, navigate]);

  const load = async () => {
    const { data: prof } = await supabase.from("profiles").select("*").eq("dni", dni).maybeSingle();
    if (!prof) return;
    setP(prof as Profile);
    const uid = (prof as Profile).id;

    const [{ data: posts }, { data: comments }, { data: likes }, { data: bans }, { data: viewRows }] = await Promise.all([
      supabase.from("posts").select("id, title, created_at, category:categories(name,color)").eq("author_id", uid).order("created_at", { ascending: false }),
      supabase.from("comments").select("id, content, created_at, post_id").eq("author_id", uid).order("created_at", { ascending: false }),
      supabase.from("likes").select("id, post_id, created_at, posts:posts(title)").eq("user_id", uid).order("created_at", { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("user_bans").select("reason, until").eq("user_id", uid).eq("active", true).order("created_at", { ascending: false }).limit(1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("page_views").select("created_at").eq("user_id", uid).gte("created_at", isoDaysAgo(14)),
    ]);

    const acts: Activity[] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((posts ?? []) as any[]).map((x) => ({ kind: "post" as const, id: x.id, text: x.title, created_at: x.created_at, extra: x.category?.name })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((comments ?? []) as any[]).map((x) => ({ kind: "comment" as const, id: x.id, text: x.content.slice(0, 200), created_at: x.created_at, extra: x.post_id })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((likes ?? []) as any[]).map((x) => ({ kind: "like" as const, id: x.id, text: x.posts?.title ?? x.post_id, created_at: x.created_at })),
    ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    setActivity(acts);

    const cmap = new Map<string, { name: string; color: string; count: number }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const post of (posts ?? []) as any[]) {
      const c = post.category;
      if (!c) continue;
      const cur = cmap.get(c.name) ?? { name: c.name, color: c.color ?? "#888", count: 0 };
      cur.count += 1; cmap.set(c.name, cur);
    }
    setCats(Array.from(cmap.values()));

    setViews(groupByDay((viewRows ?? []).map((r: { created_at: string }) => r.created_at)));

    const b = (bans ?? [])[0];
    setBan(b && (!b.until || new Date(b.until) > new Date()) ? b : null);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [dni]);

  const applyBan = async () => {
    if (!p || !reason.trim()) return toast.error("Escribe un motivo");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("ban_user", { _user_id: p.id, _reason: reason.trim(), _duration: duration });
    if (error) return toast.error(error.message);
    toast.success("Baneado"); setReason(""); load();
  };
  const unban = async () => {
    if (!p) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("unban_user", { _user_id: p.id });
    if (error) return toast.error(error.message);
    toast.success("Desbaneado"); load();
  };
  const delAccount = async () => {
    if (!p) return;
    try {
      await delAcc({ data: { user_id: p.id } });
      toast.success("Cuenta eliminada");
      navigate({ to: "/docentes/stats" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error eliminando");
    }
  };

  const totals = useMemo(() => ({
    posts: activity.filter((a) => a.kind === "post").length,
    comments: activity.filter((a) => a.kind === "comment").length,
    likes: activity.filter((a) => a.kind === "like").length,
  }), [activity]);

  if (loading || !isTeacher) return null;
  if (!p) return (<div><Navbar /><div className="mx-auto max-w-4xl p-8">Cargando...</div></div>);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/docentes/stats" className="mb-4 inline-flex items-center gap-1 text-sm font-bold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>

        <div className="neo-card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-coral text-2xl font-extrabold text-white">
            {p.full_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-extrabold">{p.full_name}</h1>
            <p className="text-sm text-muted-foreground">{p.grade} · DNI {p.dni} · Lv {p.level} · {p.points} pts</p>
            {ban && <p className="mt-1 text-sm text-destructive font-bold">Baneado: {ban.reason}{ban.until ? ` (hasta ${new Date(ban.until).toLocaleString("es")})` : " (permanente)"}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {ban ? (
              <button onClick={unban} className="neo-btn inline-flex items-center gap-1 rounded-lg bg-mint px-3 py-2 text-sm font-bold text-ink">
                <UserCheck className="h-4 w-4" /> Desbanear
              </button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="neo-btn inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground">
                    <Ban className="h-4 w-4" /> Banear
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Banear a {p.full_name}</AlertDialogTitle>
                    <AlertDialogDescription>No podrá publicar/comentar hasta que expire o lo desbanees.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-3">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Motivo..."
                      className="w-full rounded-md border-2 border-ink bg-card p-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <div className="grid grid-cols-3 gap-2">
                      {(["1d","2d","1w","1m","permanent"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => setDuration(k)}
                          className={`rounded-md border-2 border-ink py-2 text-xs font-bold ${duration === k ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                          {({"1d":"1 día","2d":"2 días","1w":"1 semana","1m":"1 mes","permanent":"Permanente"} as const)[k]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={applyBan} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Aplicar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {user?.id !== p.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="neo-btn inline-flex items-center gap-1 rounded-lg border-2 border-destructive bg-card px-3 py-2 text-sm font-bold text-destructive">
                    <Trash2 className="h-4 w-4" /> Eliminar cuenta
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar cuenta de {p.full_name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se borrarán todas sus publicaciones, comentarios, libros y datos. Esta acción es irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={delAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="neo-card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold">Sus temas</h2>
            {cats.length === 0 ? <p className="text-sm text-muted-foreground">Aún no ha publicado.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={cats} dataKey="count" nameKey="name" outerRadius={90} label>
                    {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="neo-card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold">Visitas al sitio (14 días)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={views}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 neo-card overflow-hidden bg-[#0d1117] text-emerald-300 font-mono">
          <div className="flex items-center gap-2 border-b border-emerald-500/30 bg-black/50 px-4 py-2 text-xs text-emerald-400">
            <Terminal className="h-4 w-4" /> activity@{p.dni}:~$ tail --last 100 --user={p.dni}
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4 text-sm leading-relaxed">
            <div className="mb-3 text-emerald-500">
              &gt; {totals.posts} posts · {totals.comments} comentarios · {totals.likes} likes
            </div>
            {activity.length === 0 ? (
              <div className="text-emerald-500/60">// sin actividad registrada</div>
            ) : activity.slice(0, 100).map((a) => (
              <div key={a.kind + a.id} className="flex gap-3 border-b border-emerald-500/10 py-1.5">
                <span className="shrink-0 text-emerald-500/60">
                  [{new Date(a.created_at).toISOString().slice(0, 16).replace("T", " ")}]
                </span>
                <span className="shrink-0 text-yellow-300">
                  {a.kind === "post" && <><FileText className="inline h-3 w-3" /> POST</>}
                  {a.kind === "comment" && <><MessageCircle className="inline h-3 w-3" /> COMM</>}
                  {a.kind === "like" && <><Heart className="inline h-3 w-3" /> LIKE</>}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words text-emerald-200">
                  {a.text}
                  {"extra" in a && a.extra && <span className="ml-2 text-emerald-500/60">#{a.extra}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function isoDaysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function groupByDay(dates: string[]) {
  const map = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(5, 10), 0);
  }
  for (const s of dates) {
    const k = new Date(s).toISOString().slice(5, 10);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([day, count]) => ({ day, count }));
}
