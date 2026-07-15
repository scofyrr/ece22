import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Trash2,
  MessageCircle,
  Bot,
  User,
  Send,
} from "lucide-react";
import { N as Navbar } from "./Navbar-CmtSQadr.js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { s as supabase } from "./client-DIhsBbtt.js";
import { u as useAuth } from "./router-BQQ5DE_J.js";
import { toast } from "sonner";
import "./auth-CQiZqu43.js";
import "@supabase/supabase-js";
import "zod";
import "ai";
import "@ai-sdk/mistral";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      ...props,
    });
  },
);
Button.displayName = "Button";
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("textarea", {
    className: cn(
      "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    ),
    ref,
    ...props,
  });
});
Textarea.displayName = "Textarea";
function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!authLoading && !user)
      navigate({
        to: "/login",
      });
  }, [authLoading, user, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });
      if (error) {
        toast.error("No se pudieron cargar las conversaciones");
        return;
      }
      const list = data ?? [];
      if (list.length === 0) {
        const created = await createThread(user.id, "Nueva conversación");
        if (created) {
          setThreads([created]);
          setActiveId(created.id);
        }
      } else {
        setThreads(list);
        setActiveId(list[0].id);
      }
    })();
  }, [user]);
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", activeId)
      .order("created_at", {
        ascending: true,
      })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoadingMsgs(false);
      });
  }, [activeId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, sending]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);
  const active = useMemo(
    () => threads.find((t) => t.id === activeId) || null,
    [threads, activeId],
  );
  async function createThread(userId, title) {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: userId,
        title,
      })
      .select("id, title, updated_at")
      .single();
    if (error) {
      toast.error("No se pudo crear la conversación");
      return null;
    }
    return data;
  }
  const newThread = async () => {
    if (!user) return;
    const t = await createThread(user.id, "Nueva conversación");
    if (t) {
      setThreads((prev) => [t, ...prev]);
      setActiveId(t.id);
    }
  };
  const deleteThread = async (id) => {
    if (!confirm("¿Eliminar esta conversación?")) return;
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };
  const send = async () => {
    const text = input.trim();
    if (!text || !active || !user) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: /* @__PURE__ */ new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Sesión expirada");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: active.id,
          message: text,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content || "",
        created_at: /* @__PURE__ */ new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (messages.length === 0) {
        const title = text.slice(0, 50);
        await supabase
          .from("chat_threads")
          .update({
            title,
          })
          .eq("id", active.id);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === active.id
              ? {
                  ...t,
                  title,
                }
              : t,
          ),
        );
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error(e instanceof Error ? e.message : "Error al consultar la IA");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };
  if (authLoading || !user) {
    return /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [
        /* @__PURE__ */ jsx(Navbar, {}),
        /* @__PURE__ */ jsx("div", {
          className: "flex h-[60vh] items-center justify-center",
          children: /* @__PURE__ */ jsx(Loader2, {
            className: "h-6 w-6 animate-spin text-muted-foreground",
          }),
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "relative min-h-screen bg-background",
    children: [
      /* @__PURE__ */ jsxs("div", {
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        children: [
          /* @__PURE__ */ jsx("div", {
            className:
              "absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl",
          }),
          /* @__PURE__ */ jsx("div", {
            className:
              "absolute right-0 top-1/2 h-80 w-80 rounded-full bg-coral/15 blur-3xl",
          }),
        ],
      }),
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsxs("main", {
        className:
          "mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[280px_1fr]",
        children: [
          /* @__PURE__ */ jsxs("aside", {
            className: "neo-card flex flex-col gap-3 p-3",
            children: [
              /* @__PURE__ */ jsx("h2", {
                className: "font-display text-lg font-extrabold",
                children: "Conversaciones",
              }),
              /* @__PURE__ */ jsxs(Button, {
                onClick: newThread,
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
                  " Nueva",
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex max-h-[60vh] flex-col gap-1 overflow-y-auto",
                children: threads.map((t) =>
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `group flex items-center gap-1 rounded-md border-2 ${t.id === activeId ? "border-ink bg-primary/10" : "border-transparent hover:bg-muted"}`,
                      children: [
                        /* @__PURE__ */ jsx("button", {
                          onClick: () => setActiveId(t.id),
                          className:
                            "flex-1 truncate px-3 py-2 text-left text-sm font-semibold",
                          children: t.title,
                        }),
                        /* @__PURE__ */ jsx("button", {
                          onClick: () => deleteThread(t.id),
                          className:
                            "px-2 py-2 opacity-0 transition group-hover:opacity-100",
                          title: "Eliminar",
                          "aria-label": "Eliminar conversación",
                          children: /* @__PURE__ */ jsx(Trash2, {
                            className:
                              "h-4 w-4 text-muted-foreground hover:text-destructive",
                          }),
                        }),
                      ],
                    },
                    t.id,
                  ),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("section", {
            className: "neo-card flex h-[75vh] flex-col",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "flex items-center gap-2 border-b-2 border-ink px-4 py-3",
                children: [
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]",
                    children: /* @__PURE__ */ jsx(MessageCircle, {
                      className: "h-5 w-5",
                    }),
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("h1", {
                        className:
                          "font-display text-lg font-extrabold leading-none",
                        children: "Asistente JCM",
                      }),
                      /* @__PURE__ */ jsx("p", {
                        className: "text-xs text-muted-foreground",
                        children: "Privado · solo tú ves tus conversaciones",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                ref: scrollRef,
                className: "flex-1 space-y-4 overflow-y-auto p-4",
                children: [
                  !loadingMsgs &&
                    messages.length === 0 &&
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex h-full flex-col items-center justify-center text-center text-muted-foreground",
                      children: [
                        /* @__PURE__ */ jsx(Bot, {
                          className: "mb-3 h-12 w-12 opacity-50",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "font-semibold",
                          children: "Hola, soy el asistente del colegio.",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-sm",
                          children: "Pregúntame lo que necesites.",
                        }),
                      ],
                    }),
                  /* @__PURE__ */ jsx(AnimatePresence, {
                    initial: false,
                    children: messages.map((m) =>
                      /* @__PURE__ */ jsxs(
                        motion.div,
                        {
                          initial: {
                            opacity: 0,
                            y: 8,
                          },
                          animate: {
                            opacity: 1,
                            y: 0,
                          },
                          className: `flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`,
                          children: [
                            m.role === "assistant" &&
                              /* @__PURE__ */ jsx("div", {
                                className:
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-secondary",
                                children: /* @__PURE__ */ jsx(Bot, {
                                  className: "h-4 w-4",
                                }),
                              }),
                            /* @__PURE__ */ jsx("div", {
                              className: `max-w-[75%] whitespace-pre-wrap rounded-xl border-2 border-ink px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"}`,
                              children: m.content,
                            }),
                            m.role === "user" &&
                              /* @__PURE__ */ jsx("div", {
                                className:
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-accent",
                                children: /* @__PURE__ */ jsx(User, {
                                  className: "h-4 w-4",
                                }),
                              }),
                          ],
                        },
                        m.id,
                      ),
                    ),
                  }),
                  sending &&
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex items-center gap-2 text-sm text-muted-foreground",
                      children: [
                        /* @__PURE__ */ jsx(Bot, {
                          className: "h-4 w-4 animate-pulse",
                        }),
                        " Pensando...",
                      ],
                    }),
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "border-t-2 border-ink p-3",
                children: /* @__PURE__ */ jsxs("div", {
                  className: "flex items-end gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Textarea, {
                      ref: inputRef,
                      value: input,
                      onChange: (e) => setInput(e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      },
                      placeholder: "Escribe tu mensaje... (Enter para enviar)",
                      rows: 2,
                      className: "resize-none",
                      disabled: sending,
                    }),
                    /* @__PURE__ */ jsx(Button, {
                      onClick: send,
                      disabled: sending || !input.trim(),
                      size: "icon",
                      className: "h-12 w-12",
                      children: /* @__PURE__ */ jsx(Send, {
                        className: "h-5 w-5",
                      }),
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { ChatPage as component };
