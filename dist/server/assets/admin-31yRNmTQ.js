import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { ShieldCheck, UserMinus, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "framer-motion";
import "./auth-CQiZqu43.js";
import "@supabase/supabase-js";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function AdminPage() {
  const {
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/"
    });
  }, [isAdmin, loading, navigate]);
  const load = async () => {
    const [{
      data: profs
    }, {
      data: roles
    }] = await Promise.all([supabase.from("profiles").select("id, dni, full_name, grade, points, level").order("created_at", {
      ascending: false
    }), supabase.from("user_roles").select("user_id, role")]);
    const adminSet = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setUsers((profs ?? []).map((p) => ({
      ...p,
      is_admin: adminSet.has(p.id)
    })));
  };
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);
  const toggleAdmin = async (u) => {
    if (u.is_admin) {
      const {
        error
      } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
    } else {
      const {
        error
      } = await supabase.from("user_roles").insert({
        user_id: u.id,
        role: "admin"
      });
      if (error) return toast.error(error.message);
    }
    toast.success("Rol actualizado");
    load();
  };
  const deleteProfile = async (u) => {
    if (!confirm(`¿Eliminar perfil de ${u.full_name}?`)) return;
    const {
      error
    } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil eliminado");
    load();
  };
  if (loading || !isAdmin) return null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-5xl px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "h-8 w-8 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-extrabold", children: "Panel admin" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Gestiona usuarios y roles de la comunidad." }),
      /* @__PURE__ */ jsx("div", { className: "neo-card mt-6 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b-2 border-ink bg-muted", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "Estudiante" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "DNI" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "Grado" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "Pts" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "Lv" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-bold", children: "Rol" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y-2 divide-ink/20", children: users.map((u) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/40", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-bold", children: u.full_name }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono", children: u.dni }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: u.grade }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: u.points }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: u.level }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: u.is_admin ? /* @__PURE__ */ jsx("span", { className: "chip bg-primary text-primary-foreground", children: "Admin" }) : /* @__PURE__ */ jsx("span", { className: "chip bg-card", children: "User" }) }),
          /* @__PURE__ */ jsxs("td", { className: "flex justify-end gap-2 px-4 py-3", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => toggleAdmin(u), className: "neo-btn rounded-md bg-lemon px-2 py-1 text-xs font-bold text-ink", children: u.is_admin ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(UserMinus, { className: "mr-1 inline h-3 w-3" }),
              "Quitar admin"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "mr-1 inline h-3 w-3" }),
              "Hacer admin"
            ] }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => deleteProfile(u), className: "neo-btn rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground", children: /* @__PURE__ */ jsx(Trash2, { className: "inline h-3 w-3" }) })
          ] })
        ] }, u.id)) })
      ] }) }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Para crear el primer admin, regístrate y luego asígnate el rol manualmente desde la base de datos." })
    ] })
  ] });
}
export {
  AdminPage as component
};
