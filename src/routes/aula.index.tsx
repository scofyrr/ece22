import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, LogIn, GraduationCap, Copy } from "lucide-react";

export const Route = createFileRoute("/aula/")({
  head: () => ({ meta: [{ title: "Aula Virtual — JCM" }] }),
  component: AulaIndex,
});

type Course = {
  id: string; name: string; school: string | null; cycle: string | null;
  plan: string | null; group_name: string | null; cover_color: string | null;
  join_code: string; teacher_id: string;
};

function AulaIndex() {
  const { user, isTeacher, loading } = useAuth();
  const nav = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  const load = async () => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from("courses").select("*").order("created_at", { ascending: false });
    setCourses((data ?? []) as Course[]);
  };
  useEffect(() => { load(); }, [user]);

  if (loading) return null;
  if (!user) { nav({ to: "/login" }); return null; }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-black flex items-center gap-2"><GraduationCap className="h-8 w-8" /> Aula Virtual</h1>
        <div className="flex gap-2">
          {isTeacher ? (
            <button onClick={() => setOpenCreate(true)} className="neo-btn flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              <Plus className="h-4 w-4" /> Crear curso
            </button>
          ) : (
            <button onClick={() => setOpenJoin(true)} className="neo-btn flex items-center gap-1.5 rounded-lg bg-lemon px-4 py-2 text-sm font-bold text-ink">
              <LogIn className="h-4 w-4" /> Unirme con código
            </button>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-ink/30 p-10 text-center text-muted-foreground">
          {isTeacher ? "Aún no tienes cursos. Crea el primero." : "No estás inscrito en ningún curso. Pide el código a tu docente."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => (
            <Link key={c.id} to="/aula/$courseId" params={{ courseId: c.id }} className="group overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-[4px_4px_0_0_var(--ink)] transition hover:-translate-y-0.5">
              <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${c.cover_color}, ${c.cover_color}aa)` }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 2px, transparent 3px), radial-gradient(circle at 70% 60%, #fff 2px, transparent 3px)", backgroundSize: "40px 40px" }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                {c.school && <p className="text-xs text-primary font-semibold uppercase mt-1">{c.school}</p>}
                <div className="mt-3 space-y-0.5 text-xs text-muted-foreground">
                  {c.cycle && <div>CICLO: {c.cycle}</div>}
                  {c.plan && <div>PLAN: {c.plan}</div>}
                  {c.group_name && <div>GRUPO: {c.group_name}</div>}
                </div>
                {isTeacher && c.teacher_id === user.id && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="chip bg-lemon">Código: {c.join_code}</span>
                    <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(c.join_code); toast.success("Código copiado"); }} className="p-1 hover:bg-muted rounded">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {openCreate && <CreateCourseDialog onClose={() => { setOpenCreate(false); load(); }} />}
      {openJoin && <JoinCourseDialog onClose={() => { setOpenJoin(false); load(); }} />}
    </div>
  );
}

const COLORS = ["#6366f1", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

function CreateCourseDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS");
  const [cycle, setCycle] = useState("2026-1");
  const [plan, setPlan] = useState("2026");
  const [group, setGroup] = useState("1");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("courses").insert({
      teacher_id: user.id, name, school, cycle, plan, group_name: group, cover_color: color, join_code: code,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Curso creado. Código: ${code}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_var(--ink)]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-2xl font-black">Nuevo curso</h2>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del curso" className="w-full rounded-lg border-2 border-ink px-3 py-2" />
          <input value={school} onChange={e => setSchool(e.target.value)} placeholder="Escuela" className="w-full rounded-lg border-2 border-ink px-3 py-2 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <input value={cycle} onChange={e => setCycle(e.target.value)} placeholder="Ciclo" className="rounded-lg border-2 border-ink px-3 py-2 text-sm" />
            <input value={plan} onChange={e => setPlan(e.target.value)} placeholder="Plan" className="rounded-lg border-2 border-ink px-3 py-2 text-sm" />
            <input value={group} onChange={e => setGroup(e.target.value)} placeholder="Grupo" className="rounded-lg border-2 border-ink px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold">Color de portada</div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-ink ring-2 ring-ink" : "border-transparent"}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
          <button onClick={submit} disabled={saving} className="neo-btn rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Crear</button>
        </div>
      </div>
    </div>
  );
}

function JoinCourseDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!code.trim()) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("join_course", { _code: code.trim().toUpperCase() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Te uniste al curso!");
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_var(--ink)]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-2xl font-black">Unirse a curso</h2>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="w-full rounded-lg border-2 border-ink px-3 py-2 uppercase font-mono tracking-widest text-center text-lg" />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
          <button onClick={submit} disabled={saving} className="neo-btn rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Unirme</button>
        </div>
      </div>
    </div>
  );
}
