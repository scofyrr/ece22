import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, FileText, Video, ClipboardList, Upload, Trash2, ArrowLeft, Download, ExternalLink } from "lucide-react";
import JSZip from "jszip";

export const Route = createFileRoute("/aula/$courseId")({
  component: CourseDetail,
});

type Course = { id: string; name: string; school: string; teacher_id: string; cover_color: string; join_code: string };
type Week = { id: string; title: string; position: number };
type Item = { id: string; week_id: string; kind: "file"|"video"|"assignment"; title: string; description: string; file_url: string|null; file_name: string|null; video_url: string|null; due_at: string|null };
type Submission = { id: string; item_id: string; student_id: string; file_url: string; file_name: string|null; submitted_at: string; grade: number|null; feedback: string|null };

function CourseDetail() {
  const { courseId } = Route.useParams();
  const { user, isTeacher } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [mySubs, setMySubs] = useState<Submission[]>([]);
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});
  const [addWeekOpen, setAddWeekOpen] = useState(false);
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [submitFor, setSubmitFor] = useState<Item | null>(null);
  const [subsFor, setSubsFor] = useState<Item | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data: c } = await sb.from("courses").select("*").eq("id", courseId).maybeSingle();
    if (!c) { toast.error("Curso no encontrado"); nav({ to: "/aula" }); return; }
    setCourse(c as Course);
    const { data: w } = await sb.from("course_weeks").select("*").eq("course_id", courseId).order("position");
    setWeeks((w ?? []) as Week[]);
    const weekIds = (w ?? []).map((x: Week) => x.id);
    if (weekIds.length) {
      const { data: it } = await sb.from("course_items").select("*").in("week_id", weekIds).order("created_at");
      setItems((it ?? []) as Item[]);
    } else setItems([]);
    const { data: subs } = await sb.from("assignment_submissions").select("*").eq("student_id", user.id);
    setMySubs((subs ?? []) as Submission[]);
  }, [courseId, user, nav]);

  useEffect(() => { load(); }, [load]);

  const iAmTeacher = isTeacher && course?.teacher_id === user?.id;

  const addWeek = async (title: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("course_weeks").insert({ course_id: courseId, title, position: weeks.length });
    if (error) toast.error(error.message); else { toast.success("Semana agregada"); load(); }
  };
  const delWeek = async (id: string) => {
    if (!confirm("¿Eliminar semana y todo su contenido?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("course_weeks").delete().eq("id", id);
    load();
  };
  const delItem = async (id: string) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("course_items").delete().eq("id", id);
    load();
  };

  if (!course) return <div className="p-8 text-center">Cargando…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/aula" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Volver</Link>

      <div className="mb-6 rounded-2xl border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--ink)]" style={{ background: `linear-gradient(135deg, ${course.cover_color}22, ${course.cover_color}11)` }}>
        <h1 className="font-display text-3xl font-black">{course.name}</h1>
        <p className="text-primary text-sm font-semibold uppercase mt-1">{course.school}</p>
        {iAmTeacher && <p className="mt-2 text-xs">Código de acceso: <span className="chip bg-lemon">{course.join_code}</span></p>}
      </div>

      {iAmTeacher && (
        <button onClick={() => setAddWeekOpen(true)} className="mb-4 neo-btn inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Agregar semana
        </button>
      )}

      <div className="space-y-3">
        {weeks.length === 0 && <div className="rounded-xl border-2 border-dashed border-ink/30 p-8 text-center text-muted-foreground">Aún no hay semanas.</div>}
        {weeks.map(w => {
          const wItems = items.filter(i => i.week_id === w.id);
          const isOpen = openWeeks[w.id] ?? true;
          return (
            <div key={w.id} className="rounded-xl border-2 border-ink bg-card shadow-[3px_3px_0_0_var(--ink)]">
              <button onClick={() => setOpenWeeks(s => ({ ...s, [w.id]: !isOpen }))} className="flex w-full items-center gap-2 px-4 py-3 text-left">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <span className="flex-1 font-bold text-lg uppercase">{w.title}</span>
                {iAmTeacher && (
                  <span onClick={(e) => { e.stopPropagation(); delWeek(w.id); }} className="p-1 text-destructive hover:bg-muted rounded cursor-pointer"><Trash2 className="h-4 w-4" /></span>
                )}
              </button>
              {isOpen && (
                <div className="border-t-2 border-ink/10 px-4 py-3 space-y-2">
                  {wItems.map(it => (
                    <ItemRow key={it.id} item={it} iAmTeacher={!!iAmTeacher} mySub={mySubs.find(s => s.item_id === it.id)} onDelete={() => delItem(it.id)} onSubmit={() => setSubmitFor(it)} onViewSubs={() => setSubsFor(it)} />
                  ))}
                  {iAmTeacher && (
                    <button onClick={() => setAddItemFor(w.id)} className="w-full rounded-lg border-2 border-dashed border-ink/30 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
                      <Plus className="inline h-4 w-4" /> Agregar recurso
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addWeekOpen && <AddWeekDialog onClose={() => setAddWeekOpen(false)} onSave={addWeek} />}
      {addItemFor && <AddItemDialog weekId={addItemFor} onClose={() => { setAddItemFor(null); load(); }} />}
      {submitFor && <SubmitDialog item={submitFor} onClose={() => { setSubmitFor(null); load(); }} />}
      {subsFor && iAmTeacher && <SubsPanel item={subsFor} onClose={() => setSubsFor(null)} />}
    </div>
  );
}

function ItemRow({ item, iAmTeacher, mySub, onDelete, onSubmit, onViewSubs }: {
  item: Item; iAmTeacher: boolean; mySub?: Submission; onDelete: () => void; onSubmit: () => void; onViewSubs: () => void;
}) {
  const Icon = item.kind === "file" ? FileText : item.kind === "video" ? Video : ClipboardList;
  const color = item.kind === "file" ? "bg-blue-100 text-blue-700" : item.kind === "video" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink/20 bg-background px-3 py-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded ${color}`}><Icon className="h-5 w-5" /></div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{item.title}</div>
        {item.description && <div className="text-xs text-muted-foreground truncate">{item.description}</div>}
        {item.kind === "assignment" && item.due_at && <div className="text-xs text-orange-600">Entrega: {new Date(item.due_at).toLocaleString()}</div>}
      </div>
      <div className="flex items-center gap-2">
        {item.kind === "file" && item.file_url && <a href={item.file_url} target="_blank" rel="noopener" className="chip bg-lemon"><Download className="h-3 w-3" /> Descargar</a>}
        {item.kind === "video" && item.video_url && <a href={item.video_url} target="_blank" rel="noopener" className="chip bg-lemon"><ExternalLink className="h-3 w-3" /> Ver</a>}
        {item.kind === "assignment" && !iAmTeacher && (
          mySub ? (
            <div className="flex flex-col items-end gap-1">
              <span className="chip bg-green-100 text-green-700">Entregado ✓</span>
              {mySub.grade != null && <span className="chip bg-primary text-primary-foreground">Nota: {mySub.grade}</span>}
              {mySub.feedback && <span className="text-[10px] text-muted-foreground max-w-[180px] truncate" title={mySub.feedback}>💬 {mySub.feedback}</span>}
            </div>
          ) : <button onClick={onSubmit} className="chip bg-primary text-primary-foreground"><Upload className="h-3 w-3" /> Subir</button>
        )}
        {item.kind === "assignment" && iAmTeacher && <button onClick={onViewSubs} className="chip bg-lemon">Ver entregas</button>}
        {iAmTeacher && <button onClick={onDelete} className="p-1 text-destructive hover:bg-muted rounded"><Trash2 className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}

function AddWeekDialog({ onClose, onSave }: { onClose: () => void; onSave: (t: string) => void }) {
  const [t, setT] = useState("SEMANA ");
  return (
    <Modal onClose={onClose} title="Nueva semana">
      <input value={t} onChange={e => setT(e.target.value)} className="w-full rounded-lg border-2 border-ink px-3 py-2" />
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm">Cancelar</button>
        <button onClick={() => { onSave(t); onClose(); }} className="neo-btn rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Guardar</button>
      </div>
    </Modal>
  );
}

function AddItemDialog({ weekId, onClose }: { weekId: string; onClose: () => void }) {
  const [kind, setKind] = useState<"file"|"video"|"assignment">("file");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    let file_url: string | null = null;
    let file_name: string | null = null;
    if (kind === "file" && file) {
      const path = `${weekId}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("course-materials").upload(path, file);
      if (upErr) { toast.error(upErr.message); setSaving(false); return; }
      file_url = supabase.storage.from("course-materials").getPublicUrl(path).data.publicUrl;
      file_name = file.name;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("course_items").insert({
      week_id: weekId, kind, title, description,
      file_url, file_name,
      video_url: kind === "video" ? videoUrl : null,
      due_at: kind === "assignment" && dueAt ? dueAt : null,
    });
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Recurso agregado"); onClose(); }
  };

  return (
    <Modal onClose={onClose} title="Nuevo recurso">
      <div className="mb-3 flex gap-2">
        {(["file","video","assignment"] as const).map(k => (
          <button key={k} onClick={() => setKind(k)} className={`flex-1 rounded-lg border-2 border-ink px-3 py-2 text-xs font-bold ${kind === k ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            {k === "file" ? "Archivo" : k === "video" ? "Video" : "Entregable"}
          </button>
        ))}
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="mb-2 w-full rounded-lg border-2 border-ink px-3 py-2" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="mb-2 w-full rounded-lg border-2 border-ink px-3 py-2" rows={2} />
      {kind === "file" && <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mb-2 w-full text-sm" />}
      {kind === "video" && <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="URL de YouTube o video" className="mb-2 w-full rounded-lg border-2 border-ink px-3 py-2" />}
      {kind === "assignment" && <input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} className="mb-2 w-full rounded-lg border-2 border-ink px-3 py-2" />}
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm">Cancelar</button>
        <button onClick={submit} disabled={saving} className="neo-btn rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Guardar</button>
      </div>
    </Modal>
  );
}

function SubmitDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!file || !user || !profile) return;
    setSaving(true);
    const path = `${item.id}/${profile.dni}_${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("submissions").upload(path, file);
    if (upErr) { toast.error(upErr.message); setSaving(false); return; }
    const file_url = supabase.storage.from("submissions").getPublicUrl(path).data.publicUrl;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("assignment_submissions").upsert({
      item_id: item.id, student_id: user.id, file_url, file_name: file.name,
    }, { onConflict: "item_id,student_id" });
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Entrega enviada"); onClose(); }
  };
  return (
    <Modal onClose={onClose} title={`Entregar: ${item.title}`}>
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mb-3 w-full text-sm" />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm">Cancelar</button>
        <button onClick={submit} disabled={saving || !file} className="neo-btn rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Enviar</button>
      </div>
    </Modal>
  );
}

function SubsPanel({ item, onClose }: { item: Item; onClose: () => void }) {
  const [rows, setRows] = useState<(Submission & { full_name?: string; dni?: string })[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from("assignment_submissions").select("*").eq("item_id", item.id);
      const subs = (data ?? []) as Submission[];
      const ids = subs.map(s => s.student_id);
      if (!ids.length) { setRows([]); return; }
      const { data: profs } = await supabase.from("profiles").select("id, full_name, dni").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      setRows(subs.map(s => ({ ...s, full_name: map.get(s.student_id)?.full_name, dni: map.get(s.student_id)?.dni })));
    })();
  }, [item.id]);

  const downloadAll = async () => {
    setDownloading(true);
    const zip = new JSZip();
    for (const r of rows) {
      try {
        const res = await fetch(r.file_url);
        const blob = await res.blob();
        const ext = r.file_name?.split(".").pop() ?? "bin";
        const safeName = `${r.dni ?? "sin-dni"}_${(r.full_name ?? "alumno").replace(/[^a-z0-9]/gi, "_")}.${ext}`;
        zip.file(safeName, blob);
      } catch { /* skip */ }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `entregas_${item.title.replace(/\s+/g, "_")}.zip`; a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <Modal onClose={onClose} title={`Entregas — ${item.title}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{rows.length} entrega(s)</span>
        <button onClick={downloadAll} disabled={!rows.length || downloading} className="neo-btn inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">
          <Download className="h-3 w-3" /> Descargar todo (ZIP)
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {rows.map(r => (
          <GradeRow key={r.id} row={r} onSaved={(g, f) => setRows(rs => rs.map(x => x.id === r.id ? { ...x, grade: g, feedback: f } : x))} />
        ))}
        {!rows.length && <div className="py-6 text-center text-sm text-muted-foreground">Aún no hay entregas.</div>}
      </div>
    </Modal>
  );
}

function GradeRow({ row, onSaved }: { row: Submission & { full_name?: string; dni?: string }; onSaved: (g: number | null, f: string | null) => void }) {
  const [grade, setGrade] = useState<string>(row.grade?.toString() ?? "");
  const [feedback, setFeedback] = useState(row.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const g = grade.trim() === "" ? null : Number(grade);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("assignment_submissions").update({ grade: g, feedback: feedback || null }).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Calificación guardada"); onSaved(g, feedback || null); }
  };
  return (
    <div className="rounded border border-ink/20 px-3 py-2 text-sm space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{row.full_name ?? "Alumno"} <span className="text-xs text-muted-foreground">({row.dni})</span></div>
          <div className="text-xs text-muted-foreground">{new Date(row.submitted_at).toLocaleString()}</div>
        </div>
        <a href={row.file_url} target="_blank" rel="noopener" className="chip bg-lemon"><Download className="h-3 w-3" /> {row.file_name}</a>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" step="0.1" min="0" max="20" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Nota /20" className="w-20 rounded border-2 border-ink px-2 py-1 text-sm" />
        <input value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comentario…" className="flex-1 rounded border-2 border-ink px-2 py-1 text-sm" />
        <button onClick={save} disabled={saving} className="neo-btn rounded bg-primary px-3 py-1 text-xs font-bold text-primary-foreground disabled:opacity-50">Guardar</button>
      </div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_var(--ink)]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}
