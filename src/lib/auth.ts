import { supabase } from "@/integrations/supabase/client";

const DOMAIN = "jcm-estudiantes.edu.pe";
const TEACHER_DOMAIN = "jcm-docentes.edu.pe";

export const dniToEmail = (dni: string) => `${dni}@${DOMAIN}`;
export const teacherDniToEmail = (dni: string) => `${dni}@${TEACHER_DOMAIN}`;

export const signUpWithDni = async (params: {
  dni: string;
  password: string;
  full_name: string;
  grade: string;
}) => {
  const { dni, password, full_name, grade } = params;
  const result = await supabase.auth.signUp({
    email: dniToEmail(dni),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { dni, full_name, grade },
    },
  });
  if (result.error) return result;
  if (!result.data.session) {
    await supabase.auth.signInWithPassword({
      email: dniToEmail(dni),
      password,
    });
  }
  return result;
};

export const signInWithDni = async (dni: string, password: string) =>
  supabase.auth.signInWithPassword({ email: dniToEmail(dni), password });

/** Alta docente — código modular 10 dígitos + DNI 8 + nombre completo. */
export const signUpAsTeacher = async (params: {
  codigo_modular: string;
  dni: string;
  full_name: string;
  password: string;
}) => {
  const { codigo_modular, dni, full_name, password } = params;
  const email = teacherDniToEmail(dni);
  const signup = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { dni, full_name, codigo_modular, role: "docente" },
    },
  });
  if (signup.error) return signup;

  if (!signup.data.session) {
    const login = await supabase.auth.signInWithPassword({ email, password });
    if (login.error) return { data: signup.data, error: login.error };
  }

  // Registrar perfil docente vía RPC (crea teacher_profiles + user_roles + profiles)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: rpcErr } = await (supabase as any).rpc("register_teacher", {
    _codigo_modular: codigo_modular,
    _full_name: full_name,
    _dni: dni,
  });
  if (rpcErr) {
    return { data: signup.data, error: rpcErr as unknown as null };
  }
  return signup;
};

export const signInAsTeacher = async (dni: string, password: string) =>
  supabase.auth.signInWithPassword({ email: teacherDniToEmail(dni), password });

export const signOut = async () => supabase.auth.signOut();
