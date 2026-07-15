import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import {
  GraduationCap, LogOut, PenSquare, Trophy, ShieldCheck,
  BookMarked, MessageCircle, Rss, BarChart3, School,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const links = [
    { to: "/feed", label: "Feed", icon: Rss },
    { to: "/biblioteca", label: "Biblioteca", icon: BookMarked },
    { to: "/aula", label: "Aula Virtual", icon: School },
    { to: "/chat", label: "Chat IA", icon: MessageCircle },
    { to: "/ranking", label: "Ranking", icon: Trophy },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]"
          >
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <div className="font-display text-xl font-extrabold leading-none">
            JCM<span className="text-primary">.</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-muted"
              activeProps={{ className: "bg-muted" }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {isTeacher && (
            <Link
              to="/docentes/stats"
              className="flex items-center gap-1.5 rounded-md bg-lemon px-3 py-1.5 text-sm font-bold text-ink"
              activeProps={{ className: "ring-2 ring-primary" }}
            >
              <BarChart3 className="h-4 w-4" /> Docentes
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-muted">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && profile ? (
            <>
              <Link to="/new" className="neo-btn hidden items-center gap-1.5 rounded-lg bg-lemon px-3 py-1.5 text-sm font-bold text-ink sm:inline-flex">
                <PenSquare className="h-4 w-4" /> Publicar
              </Link>
              <Link to="/profile/$dni" params={{ dni: profile.dni }} className="flex items-center gap-2 rounded-lg border-2 border-ink bg-card px-2 py-1 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] hover:bg-muted">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-xs font-extrabold text-white">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="chip ml-1 bg-lemon"><Trophy className="h-3 w-3" /> {profile.points}</span>
                {isTeacher && <GraduationCap className="h-4 w-4 text-primary" aria-label="Docente" />}
                {isAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}
              </Link>
              <button onClick={handleLogout} className="rounded-md p-2 hover:bg-muted" aria-label="Salir">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 text-sm font-bold hover:bg-muted">Entrar</Link>
              <Link to="/register" className="neo-btn rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
