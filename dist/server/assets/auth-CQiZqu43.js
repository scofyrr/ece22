import { s as supabase } from "./client-DIhsBbtt.js";
const DOMAIN = "jcm-estudiantes.edu.pe";
const dniToEmail = (dni) => `${dni}@${DOMAIN}`;
const signUpWithDni = async (params) => {
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
const signInWithDni = async (dni, password) =>
  supabase.auth.signInWithPassword({ email: dniToEmail(dni), password });
const signOut = async () => supabase.auth.signOut();
export { signInWithDni as a, signOut as b, signUpWithDni as s };
