import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import {
  U as UPLOAD_FEE,
  a as BookUploadForm,
} from "./BookUploadForm-k0rFeF28.js";
import { Coins } from "lucide-react";
import "./client-DIhsBbtt.js";
import "@supabase/supabase-js";
import "sonner";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function SubirLibroPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authLoading && !user)
      navigate({
        to: "/login",
      });
  }, [authLoading, user, navigate]);
  useEffect(() => {
    if (user) void refreshProfile();
  }, [user, refreshProfile]);
  return /* @__PURE__ */ jsxs("main", {
    className: "mx-auto max-w-2xl px-4 py-8",
    children: [
      /* @__PURE__ */ jsx("h1", {
        className: "font-display text-4xl font-extrabold",
        children: "Subir un libro",
      }),
      /* @__PURE__ */ jsxs("p", {
        className: "text-muted-foreground",
        children: [
          "Cuesta ",
          /* @__PURE__ */ jsxs("b", { children: [UPLOAD_FEE, " puntos"] }),
          " publicar. Otros pagan ",
          /* @__PURE__ */ jsx("b", { children: "20 pts" }),
          " para descargarlo (100% para ti).",
        ],
      }),
      profile &&
        /* @__PURE__ */ jsxs("p", {
          className:
            "mt-2 inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lemon px-2 py-1 text-sm font-bold",
          children: [
            /* @__PURE__ */ jsx(Coins, { className: "h-4 w-4" }),
            " Tienes ",
            profile.points,
            " pts",
          ],
        }),
      /* @__PURE__ */ jsx("div", {
        className: "neo-card mt-6 p-6",
        children: /* @__PURE__ */ jsx(BookUploadForm, {}),
      }),
    ],
  });
}
export { SubirLibroPage as component };
