import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, Outlet } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { s as supabase } from "./client-DIhsBbtt.js";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Coins, Upload, BookOpen, Download } from "lucide-react";
import {
  B as BOOK_FILE_ACCEPT,
  a as BookUploadForm,
  v as validateBookFile,
} from "./BookUploadForm-k0rFeF28.js";
import "./auth-CQiZqu43.js";
import "@supabase/supabase-js";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function BibliotecaPage() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isSubirRoute = pathname === "/biblioteca/subir";
  if (isSubirRoute) {
    return /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen",
      children: [
        /* @__PURE__ */ jsx(Navbar, {}),
        /* @__PURE__ */ jsx(Outlet, {}),
      ],
    });
  }
  return /* @__PURE__ */ jsx(BibliotecaCatalog, {});
}
function BibliotecaCatalog() {
  const { user, profile, refreshProfile } = useAuth();
  const [books, setBooks] = useState([]);
  const [owned, setOwned] = useState(/* @__PURE__ */ new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);
  const quickFileRef = useRef(null);
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select(
        "id,title,author,description,cover_url,price_points,owner_id,pdf_path",
      )
      .order("created_at", {
        ascending: false,
      });
    if (error) {
      console.error(error);
      toast.error("No se pudo cargar la biblioteca");
    }
    setBooks(data ?? []);
    if (profile) {
      const { data: p } = await supabase
        .from("book_purchases")
        .select("book_id")
        .eq("buyer_id", profile.id);
      setOwned(new Set((p ?? []).map((r) => r.book_id)));
    } else {
      setOwned(/* @__PURE__ */ new Set());
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [profile?.id]);
  const buy = async (book) => {
    if (!profile) {
      toast.error("Inicia sesión para canjear");
      return;
    }
    const PRICE = 20;
    if ((profile.points ?? 0) < PRICE) {
      toast.error(`Te faltan ${PRICE - (profile.points ?? 0)} puntos`);
      return;
    }
    setBusyId(book.id);
    const { error } = await supabase.rpc("purchase_book", {
      _book_id: book.id,
    });
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`¡Canjeado! Ya puedes descargar "${book.title}" 📚`);
    await Promise.all([load(), refreshProfile()]);
  };
  const download = async (book) => {
    setBusyId(book.id);
    const { data, error } = await supabase.storage
      .from("book-pdfs")
      .createSignedUrl(book.pdf_path, 60 * 10);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "No se pudo generar el enlace");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  const openUploadPicker = () => {
    if (!user) {
      toast.error("Inicia sesión para subir libros");
      return;
    }
    quickFileRef.current?.click();
  };
  const onQuickFile = (f) => {
    if (!f) return;
    const check = validateBookFile(f);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setPickedFile(f);
    setUploadOpen(true);
    if (quickFileRef.current) quickFileRef.current.value = "";
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsx("input", {
        ref: quickFileRef,
        type: "file",
        className: "hidden",
        accept: BOOK_FILE_ACCEPT,
        onChange: (e) => onQuickFile(e.target.files?.[0] ?? null),
      }),
      uploadOpen &&
        /* @__PURE__ */ jsx(BookUploadForm, {
          asDialog: true,
          open: uploadOpen,
          initialFile: pickedFile,
          onClose: () => {
            setUploadOpen(false);
            setPickedFile(null);
          },
        }),
      /* @__PURE__ */ jsxs("main", {
        className: "mx-auto max-w-6xl px-4 py-8",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("h1", {
                    className: "font-display text-4xl font-extrabold",
                    children: "Biblioteca Digital",
                  }),
                  /* @__PURE__ */ jsx("p", {
                    className: "text-muted-foreground",
                    children:
                      "Sube tus libros y canjea puntos por los de otros estudiantes.",
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
                ],
              }),
              /* @__PURE__ */ jsxs("button", {
                type: "button",
                onClick: openUploadPicker,
                className:
                  "neo-btn inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground",
                children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                  " Subir libro",
                ],
              }),
            ],
          }),
          loading
            ? /* @__PURE__ */ jsx("div", {
                className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                children: [...Array(6)].map((_, i) =>
                  /* @__PURE__ */ jsx(
                    "div",
                    { className: "neo-card h-72 animate-pulse" },
                    i,
                  ),
                ),
              })
            : books.length === 0
              ? /* @__PURE__ */ jsxs("div", {
                  className: "neo-card p-10 text-center",
                  children: [
                    /* @__PURE__ */ jsx(BookOpen, {
                      className: "mx-auto h-10 w-10",
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-3 font-display text-2xl font-bold",
                      children: "Aún no hay libros.",
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-1 text-muted-foreground",
                      children: "¡Sé el primero en compartir uno!",
                    }),
                    /* @__PURE__ */ jsxs("button", {
                      type: "button",
                      onClick: openUploadPicker,
                      className:
                        "neo-btn mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-primary-foreground",
                      children: [
                        /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
                        " Subir el primero",
                      ],
                    }),
                  ],
                })
              : /* @__PURE__ */ jsx("div", {
                  className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  children: books.map((b) => {
                    const isOwned = owned.has(b.id);
                    const isMine = profile?.id === b.owner_id;
                    const isBusy = busyId === b.id;
                    return /* @__PURE__ */ jsxs(
                      motion.div,
                      {
                        whileHover: {
                          y: -6,
                        },
                        className: "neo-card flex flex-col overflow-hidden",
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "aspect-[3/4] w-full overflow-hidden border-b-2 border-ink bg-muted",
                            children: b.cover_url
                              ? /* @__PURE__ */ jsx("img", {
                                  src: b.cover_url,
                                  alt: b.title,
                                  className: "h-full w-full object-cover",
                                  loading: "lazy",
                                })
                              : /* @__PURE__ */ jsx("div", {
                                  className:
                                    "flex h-full items-center justify-center",
                                  children: /* @__PURE__ */ jsx(BookOpen, {
                                    className:
                                      "h-12 w-12 text-muted-foreground",
                                  }),
                                }),
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "flex flex-1 flex-col p-4",
                            children: [
                              /* @__PURE__ */ jsx("h3", {
                                className:
                                  "font-display text-lg font-extrabold leading-tight",
                                children: b.title,
                              }),
                              b.author &&
                                /* @__PURE__ */ jsxs("p", {
                                  className: "text-xs text-muted-foreground",
                                  children: ["por ", b.author],
                                }),
                              b.description &&
                                /* @__PURE__ */ jsx("p", {
                                  className:
                                    "mt-2 line-clamp-2 text-sm text-muted-foreground",
                                  children: b.description,
                                }),
                              /* @__PURE__ */ jsxs("div", {
                                className:
                                  "mt-auto flex items-center justify-between pt-4",
                                children: [
                                  /* @__PURE__ */ jsxs("span", {
                                    className: "chip bg-lemon",
                                    children: [
                                      /* @__PURE__ */ jsx(Coins, {
                                        className: "h-3 w-3",
                                      }),
                                      " 20",
                                    ],
                                  }),
                                  isMine
                                    ? /* @__PURE__ */ jsx("span", {
                                        className:
                                          "text-xs font-bold text-muted-foreground",
                                        children: "Tu libro",
                                      })
                                    : isOwned
                                      ? /* @__PURE__ */ jsxs("button", {
                                          onClick: () => download(b),
                                          disabled: isBusy,
                                          className:
                                            "neo-btn inline-flex items-center gap-1 rounded-lg bg-mint px-3 py-1.5 text-sm font-bold text-ink disabled:opacity-50",
                                          children: [
                                            /* @__PURE__ */ jsx(Download, {
                                              className: "h-4 w-4",
                                            }),
                                            " ",
                                            isBusy ? "Abriendo..." : "Leer",
                                          ],
                                        })
                                      : /* @__PURE__ */ jsx("button", {
                                          onClick: () => buy(b),
                                          disabled: isBusy,
                                          className:
                                            "neo-btn rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-50",
                                          children: isBusy
                                            ? "Canjeando..."
                                            : "Canjear",
                                        }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      b.id,
                    );
                  }),
                }),
        ],
      }),
    ],
  });
}
export { BibliotecaPage as component };
