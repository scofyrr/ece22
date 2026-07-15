import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Elimina la cuenta de un usuario (solo docente/admin). Requiere SUPABASE_SERVICE_ROLE_KEY. */
export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // Verificar rol docente/admin
    const { data: rows } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = new Set((rows ?? []).map((r: any) => String(r.role)));
    if (!roles.has("docente") && !roles.has("admin")) {
      throw new Error("Solo docentes o administradores pueden eliminar cuentas");
    }
    if (data.user_id === context.userId) {
      throw new Error("No puedes eliminar tu propia cuenta");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Borra el usuario de auth → cascada borra profile, posts, comentarios, etc.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
