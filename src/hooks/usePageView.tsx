import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Registra una visita en `page_views` cada vez que cambia la ruta. */
export function usePageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // fire-and-forget; ignoramos errores para no romper la nav
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("page_views")
      .insert({
        user_id: user?.id ?? null,
        path: pathname,
      })
      .then(
        () => {},
        () => {},
      );
  }, [pathname, user?.id]);
}
