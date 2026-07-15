import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Plus, Trash2, Bot, User as UserIcon, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat IA — Colegio JCM" },
      { name: "description", content: "Asistente virtual del colegio José Carlos Mariátegui." },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };
type Thread = { id: string; title: string; updated_at: string };

function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  // Load threads
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) {
        toast.error("No se pudieron cargar las conversaciones");
        return;
      }
      const list = (data ?? []) as Thread[];
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

  // Load messages of active thread
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
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as Msg[]);
        setLoadingMsgs(false);
      });
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const active = useMemo(() => threads.find((t) => t.id === activeId) || null, [threads, activeId]);

  async function createThread(userId: string, title: string): Promise<Thread | null> {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title })
      .select("id, title, updated_at")
      .single();
    if (error) {
      toast.error("No se pudo crear la conversación");
      return null;
    }
    return data as Thread;
  }

  const newThread = async () => {
    if (!user) return;
    const t = await createThread(user.id, "Nueva conversación");
    if (t) {
      setThreads((prev) => [t, ...prev]);
      setActiveId(t.id);
    }
  };

  const deleteThread = async (id: string) => {
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
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
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
        body: JSON.stringify({ thread_id: active.id, message: text }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Error");

      const aiMsg: Msg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content || "",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Auto-title si es la primera interacción
      if (messages.length === 0) {
        const title = text.slice(0, 50);
        await supabase.from("chat_threads").update({ title }).eq("id", active.id);
        setThreads((prev) =>
          prev.map((t) => (t.id === active.id ? { ...t, title } : t)),
        );
      }
    } catch (e) {
      // Revertir mensaje optimista
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error(e instanceof Error ? e.message : "Error al consultar la IA");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Bloom de fondo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-coral/15 blur-3xl" />
      </div>
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="neo-card flex flex-col gap-3 p-3">
          <h2 className="font-display text-lg font-extrabold">Conversaciones</h2>

          <Button onClick={newThread} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Nueva
          </Button>

          <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-md border-2 ${
                  t.id === activeId ? "border-ink bg-primary/10" : "border-transparent hover:bg-muted"
                }`}
              >
                <button
                  onClick={() => setActiveId(t.id)}
                  className="flex-1 truncate px-3 py-2 text-left text-sm font-semibold"
                >
                  {t.title}
                </button>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="px-2 py-2 opacity-0 transition group-hover:opacity-100"
                  title="Eliminar"
                  aria-label="Eliminar conversación"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <section className="neo-card flex h-[75vh] flex-col">
          <div className="flex items-center gap-2 border-b-2 border-ink px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--ink)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold leading-none">Asistente JCM</h1>
              <p className="text-xs text-muted-foreground">Privado · solo tú ves tus conversaciones</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {!loadingMsgs && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="mb-3 h-12 w-12 opacity-50" />
                <p className="font-semibold">Hola, soy el asistente del colegio.</p>
                <p className="text-sm">Pregúntame lo que necesites.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-secondary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] whitespace-pre-wrap rounded-xl border-2 border-ink px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-accent">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-4 w-4 animate-pulse" /> Pensando...
              </div>
            )}
          </div>

          <div className="border-t-2 border-ink p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Escribe tu mensaje... (Enter para enviar)"
                rows={2}
                className="resize-none"
                disabled={sending}
              />
              <Button onClick={send} disabled={sending || !input.trim()} size="icon" className="h-12 w-12">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
