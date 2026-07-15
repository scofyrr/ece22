import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Adjunta automáticamente el token del usuario a cada llamada de server function.
// Sin esto, las funciones protegidas con requireSupabaseAuth devuelven 401.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
