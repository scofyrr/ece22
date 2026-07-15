import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { Trophy, Crown, Medal } from "lucide-react";
import "framer-motion";
import "./router-BQQ5DE_J.js";
import "sonner";
import "zod";
import "@supabase/supabase-js";
import "ai";
import "@ai-sdk/mistral";
import "./auth-CQiZqu43.js";
function RankingPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("dni, full_name, grade, points, max_points, level")
        .gt("max_points", 0)
        .order("max_points", {
          ascending: false,
        })
        .limit(50);
      if (error) {
        const res = await supabase
          .from("profiles")
          .select("dni, full_name, grade, points, level")
          .gt("points", 0)
          .order("points", {
            ascending: false,
          })
          .limit(50);
        setRows(
          (res.data ?? []).map((r) => ({
            ...r,
            max_points: r.points,
          })),
        );
        return;
      }
      setRows(data ?? []);
    })();
  }, []);
  const trophy = (i) => {
    if (i === 0)
      return /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-lemon" });
    if (i === 1) return /* @__PURE__ */ jsx(Medal, { className: "h-5 w-5" });
    if (i === 2)
      return /* @__PURE__ */ jsx(Medal, { className: "h-5 w-5 text-coral" });
    return /* @__PURE__ */ jsxs("span", {
      className: "text-sm font-extrabold text-muted-foreground",
      children: ["#", i + 1],
    });
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsxs("main", {
        className: "mx-auto max-w-3xl px-4 py-8",
        children: [
          /* @__PURE__ */ jsx("h1", {
            className: "font-display text-4xl font-extrabold",
            children: "Ranking",
          }),
          /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "Los estudiantes que más están enseñando esta temporada.",
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "neo-card mt-6 divide-y-2 divide-ink overflow-hidden",
            children: [
              rows.length === 0 &&
                /* @__PURE__ */ jsx("div", {
                  className: "p-6 text-center text-muted-foreground",
                  children: "Aún sin actividad.",
                }),
              rows.map((r, i) =>
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/profile/$dni",
                    params: {
                      dni: r.dni,
                    },
                    className: `flex items-center gap-4 px-4 py-3 hover:bg-muted ${i < 3 ? "bg-card" : ""}`,
                    children: [
                      /* @__PURE__ */ jsx("div", {
                        className: "flex w-10 justify-center",
                        children: trophy(i),
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-coral font-extrabold text-white",
                        children: r.full_name.charAt(0),
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex-1",
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className: "font-bold",
                            children: r.full_name,
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className: "text-xs text-muted-foreground",
                            children: r.grade,
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "chip bg-lemon",
                        children: [
                          /* @__PURE__ */ jsx(Trophy, { className: "h-3 w-3" }),
                          " Lv ",
                          r.level,
                        ],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "font-display text-lg font-extrabold",
                        title: `Actual: ${r.points} pts`,
                        children: r.max_points ?? r.points,
                      }),
                    ],
                  },
                  r.dni,
                ),
              ),
            ],
          }),
        ],
      }),
    ],
  });
}
export { RankingPage as component };
