import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** Rectángulos verticales fijos a la izquierda (estilo Moodle "Ocultar barras / Tablero del curso"). */
export default function TeacherStatsHandle() {
  const { isTeacher } = useAuth();
  if (!isTeacher) return null;

  return (
    <div className="fixed left-0 top-1/3 z-40 flex flex-col gap-2">
      <SideTab
        to="/docentes/stats"
        label="Panel Docente"
        icon={<BarChart3 className="h-4 w-4" />}
        bg="bg-primary text-primary-foreground"
      />
      <SideTab
        to="/docentes/stats"
        label="Registros"
        icon={<Users className="h-4 w-4" />}
        bg="bg-ink text-paper"
      />
    </div>
  );
}

function SideTab({
  to,
  label,
  icon,
  bg,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ x: -4 }}
      whileHover={{ x: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        to={to}
        className={`flex h-32 w-9 flex-col items-center justify-center gap-2 rounded-r-lg border-2 border-ink ${bg} shadow-[3px_3px_0_0_var(--ink)]`}
      >
        {icon}
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
