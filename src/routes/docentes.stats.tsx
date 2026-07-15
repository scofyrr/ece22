import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart3, Users, FileText, Book, Ban, TrendingUp, Eye,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/docentes/stats")({
  head: () => ({ meta: [{ title: "Panel Docente — ECE" }] }),
  component: DocentesStats,
});

type UserRow = { id: string; dni: string; full_name: string; grade: string; points: number; level: number };
type CatSlice = { name: string; color: string; emoji: string; count: number };
type DayRow = { day: string; count: number };

function DocentesStats() {
  const { isTeacher, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totals, setTotals] = useState({ users: 0, posts: 0, books: 0, bans: 0 });
  const [cats, setCats] = useState<CatSlice[]>([]);
  const [views, setViews] = useState<DayRow[]>([]);
  const [postsPerDay, setPostsPerDay] = useState<DayRow[]>([]);
  const [barMode, setBarMode] = useState<"views" | "posts">("views");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loading && !isTeacher) navigate({ to: "/" });
  }, [loading, isTeacher, navigate]);

  useEffect(() => {
    if (!isTeacher) return;
    (async () => {
      const [{ data: us }, { count: pc }, { count: bc }, { count: banC }, { data: catRows }, { data: viewRows }, { data: postRows }] = await Promise.all([
        supabase.from("profiles").select("id,dni,full_name,grade,points,level").order("points", { ascending: false }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("books").select("*", { count: "exact", head: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("user_bans").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("posts").select("category_id, categories!inner(name,color,emoji)").limit(5000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("page_views").select("created_at").gte("created_at", isoDaysAgo(14)),
        supabase.from("posts").select("created_at").gte("created_at", isoDaysAgo(14)),
      ]);
      setUsers((us ?? []) as UserRow[]);
      setTotals({ users: (us ?? []).length, posts: pc ?? 0, books: bc ?? 0, bans: banC ?? 0 });

      const byCat = new Map<string, CatSlice>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const r of (catRows ?? []) as any[]) {
        const c = r.categories;
        if (!c) continue;
        const key = c.name as string;
        const cur = byCat.get(key) ?? { name: key, color: c.color ?? "#888", emoji: c.emoji ?? "•", count: 0 };
        cur.count += 1;
        byCat.set(key, cur);
      }
      setCats(Array.from(byCat.values()).sort((a, b) => b.count - a.count));

      setViews(groupByDay((viewRows ?? []).map((r: { created_at: string }) => r.created_at)));
      setPostsPerDay(groupByDay((postRows ?? []).map((r) => r.created_at)));
    })();
  }, [isTeacher]);

  const filtered = useMemo(() =>
    users.filter((u) => u.full_name.toLowerCase().includes(query.toLowerCase()) || u.dni.includes(query))
  , [users, query]);

  if (loading || !isTeacher) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg border-2 border-ink bg-primary p-2 text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-extrabold">Panel Docente</h1>
            <p className="text-muted-foreground">Métricas y moderación de la plataforma.</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={<Users />} label="Estudiantes" value={totals.users} color="bg-primary text-primary-foreground" />
          <StatCard icon={<FileText />} label="Publicaciones" value={totals.posts} color="bg-lemon text-ink" />
          <StatCard icon={<Book />} label="Libros" value={totals.books} color="bg-mint text-ink" />
          <StatCard icon={<Ban />} label="Baneos activos" value={totals.bans} color="bg-destructive text-destructive-foreground" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="neo-card p-5">
            <h2 className="mb-3 font-display text-xl font-extrabold">Publicaciones por categoría</h2>
            {cats.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay datos.</p> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={cats} dataKey="count" nameKey="name" innerRadius={50} outerRadius={100} label={(e) => `${e.name}`}>
                    {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {cats.map((c) => (
                <li key={c.name} className="flex items-center gap-1 rounded-md border-2 border-ink bg-card px-2 py-1 font-bold">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.emoji} {c.name} · {c.count}
                </li>
              ))}
            </ul>
          </div>

          <div className="neo-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">Actividad (14 días)</h2>
              <button onClick={() => setBarMode((m) => m === "views" ? "posts" : "views")}
                className="neo-btn inline-flex items-center gap-1 rounded-md bg-lemon px-3 py-1.5 text-xs font-bold text-ink">
                {barMode === "views" ? <><Eye className="h-3 w-3" /> Visitas</> : <><TrendingUp className="h-3 w-3" /> Publicaciones</>}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barMode === "views" ? views : postsPerDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={barMode === "views" ? "#6366f1" : "#22c55e"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold">Estudiantes</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full max-w-sm rounded-lg border-2 border-ink bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="neo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b-2 border-ink bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Nombre</th>
                    <th className="px-4 py-3 text-left font-bold">DNI</th>
                    <th className="px-4 py-3 text-left font-bold">Grado</th>
                    <th className="px-4 py-3 text-right font-bold">Pts</th>
                    <th className="px-4 py-3 text-right font-bold">Lv</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink/20">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-bold">{u.full_name}</td>
                      <td className="px-4 py-3 font-mono">{u.dni}</td>
                      <td className="px-4 py-3">{u.grade}</td>
                      <td className="px-4 py-3 text-right">{u.points}</td>
                      <td className="px-4 py-3 text-right">{u.level}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/docentes/estudiante/$dni" params={{ dni: u.dni }} className="neo-btn rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="neo-card flex items-center gap-3 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-extrabold">{value}</div>
      </div>
    </div>
  );
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function groupByDay(dates: string[]): DayRow[] {
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
