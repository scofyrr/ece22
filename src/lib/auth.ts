import { supabase } from "@/integrations/supabase/client";

const DOMAIN = "jcm-estudiantes.edu.pe";
export const dniToEmail = (dni: string) => `${dni}@${DOMAIN}`;

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
  // Si la confirmación de email está activa, signUp no crea sesión.
  // Intentamos iniciar sesión inmediatamente (funciona si confirm está OFF).
  if (!result.data.session) {
    await supabase.auth.signInWithPassword({ email: dniToEmail(dni), password });
  }
  return result;
};

export const signInWithDni = async (dni: string, password: string) =>
  supabase.auth.signInWithPassword({ email: dniToEmail(dni), password });

export const signOut = async () => supabase.auth.signOut();
