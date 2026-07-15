import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { signUpWithDni, signUpAsTeacher } from "@/lib/auth";
import { toast } from "sonner";
import { Sparkles, GraduationCap, User } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Crear cuenta — ECE" }] }),
  component: RegisterPage,
});

const studentSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  full_name: z.string().trim().min(2, "Nombre muy corto").max(80),
  grade: z.string().trim().min(1),
  password: z.string().min(6).max(72),
});
const teacherSchema = z.object({
  codigo_modular: z.string().regex(/^\d{10}$/, "El código modular debe tener 10 dígitos"),
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  full_name: z.string().trim().min(2, "Nombre muy corto").max(120),
  password: z.string().min(6).max(72),
});

const GRADES = ["Primaria", "1° Secundaria", "2° Secundaria", "3° Secundaria", "4° Secundaria", "5° Secundaria", "Universidad", "Otro"];

function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"student" | "teacher">("student");
  // shared
  const [dni, setDni] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  // student
  const [grade, setGrade] = useState(GRADES[3]);
  // teacher
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (tab === "teacher") {
      const parsed = teacherSchema.safeParse({ codigo_modular: codigo, dni, full_name: fullName, password });
      if (!parsed.success) { toast.error(parsed.error.errors[0].message); setLoading(false); return; }
      const { error } = await signUpAsTeacher(parsed.data);
      setLoading(false);
      if (error) {
        const m = error.message ?? "";
        toast.error(m.includes("already") ? "Este DNI ya está registrado"
          : m.includes("teacher_profiles_codigo_modular_key") ? "Ese código modular ya está en uso"
          : m);
        return;
      }
      toast.success("¡Cuenta de docente creada! 🎓");
      navigate({ to: "/feed" });
      return;
    }
    const parsed = studentSchema.safeParse({ dni, full_name: fullName, grade, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); setLoading(false); return; }
    const { error } = await signUpWithDni({ dni, password, full_name: fullName, grade });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Este DNI ya está registrado" : error.message);
      return;
    }
    toast.success("¡Cuenta creada! 🎉");
    navigate({ to: "/feed" });
  };

  const inputCls = "w-full rounded-lg border-2 border-ink bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="neo-card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-extrabold">ECE</span>
        </Link>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border-2 border-ink bg-muted p-1">
          <button type="button" onClick={() => setTab("student")}
            className={`flex items-center justify-center gap-1 rounded-md py-2 text-sm font-bold ${tab === "student" ? "bg-primary text-primary-foreground" : ""}`}>
            <User className="h-4 w-4" /> Estudiante
          </button>
          <button type="button" onClick={() => setTab("teacher")}
            className={`flex items-center justify-center gap-1 rounded-md py-2 text-sm font-bold ${tab === "teacher" ? "bg-primary text-primary-foreground" : ""}`}>
            <GraduationCap className="h-4 w-4" /> Docente
          </button>
        </div>

        <h1 className="font-display text-3xl font-extrabold">
          {tab === "teacher" ? "Registro Docente" : "Crear cuenta"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {tab === "teacher" && (
            <div>
              <label className="mb-1 block text-sm font-bold">Código Modular <span className="text-muted-foreground">(10 dígitos)</span></label>
              <input inputMode="numeric" maxLength={10} value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                placeholder="1234567890"
                className={`${inputCls} font-mono`} />
              <p className="mt-1 text-xs text-muted-foreground">Código que identifica al profesor en planilla / PerúEduca.</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-bold">DNI <span className="text-muted-foreground">(8 dígitos)</span></label>
            <input inputMode="numeric" maxLength={8} value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              placeholder="12345678"
              className={`${inputCls} font-mono text-lg`} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Nombre completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Ana Pérez Rojas" maxLength={120} className={inputCls} />
          </div>
          {tab === "student" && (
            <div>
              <label className="mb-1 block text-sm font-bold">Grado / nivel</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-bold">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              minLength={6} className={inputCls} />
          </div>
          <button disabled={loading} className="neo-btn w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">
            {loading ? "Creando..." : tab === "teacher" ? "Crear cuenta docente" : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-bold text-primary underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
