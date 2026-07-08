import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { generateText, tool, stepCountIs } from "ai";
import { buildFullSystemPrompt } from "@/content/ai-context";
import { mistral, MISTRAL_CHAT_MODEL } from "@/lib/ai-gateway.server";
import { fetchPlatformContext } from "@/lib/ai-platform-context.server";
import { moderateUserInput, moderateAssistantOutput } from "@/lib/ai-moderation.server";
import { messageNeedsWebHint, searchWeb } from "@/lib/ai-web-search.server";

const bodySchema = z.object({
  thread_id: z.string().uuid(),
  message: z.string().min(1).max(8000),
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const DEFAULT_SUPABASE_URL = "https://dbbgrvvpnevxfoexqezs.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1ttTeFTd0vmorjPGwhYlKg_ehXypSMZ";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return jsonResponse({ error: "No autenticado" }, 401);

        const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_KEY) {
          return jsonResponse({ error: "Servidor mal configurado (Supabase)" }, 500);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) {
          return jsonResponse({ error: "Sesión inválida" }, 401);
        }
        const userId = userData.user.id;

        let payload: z.infer<typeof bodySchema>;
        try {
          payload = bodySchema.parse(await request.json());
        } catch (err) {
          return jsonResponse(
            { error: err instanceof z.ZodError ? err.errors[0]?.message : "Cuerpo inválido" },
            400,
          );
        }

        const inputMod = moderateUserInput(payload.message);
        if (!inputMod.allowed) {
          return jsonResponse({ content: inputMod.userMessage });
        }

        const { data: thread, error: thErr } = await supabase
          .from("chat_threads")
          .select("id, user_id")
          .eq("id", payload.thread_id)
          .maybeSingle();
        if (thErr || !thread || thread.user_id !== userId) {
          return jsonResponse({ error: "Hilo no encontrado" }, 404);
        }

        const { data: history } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("thread_id", payload.thread_id)
          .order("created_at", { ascending: true })
          .limit(30);

        const { error: insErr } = await supabase.from("chat_messages").insert({
          thread_id: payload.thread_id,
          role: "user",
          content: payload.message,
        });
        if (insErr) {
          return jsonResponse({ error: "No se pudo guardar el mensaje" }, 500);
        }

        const [platformData, webPrefetch] = await Promise.all([
          fetchPlatformContext(supabase),
          messageNeedsWebHint(payload.message)
            ? searchWeb(payload.message.slice(0, 120))
            : Promise.resolve(null),
        ]);

        let systemPrompt = buildFullSystemPrompt(platformData);
        if (webPrefetch) {
          systemPrompt += `\n\n### Búsqueda web previa\n${webPrefetch}`;
        }

        const chatHistory = (history ?? [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        try {
          const result = await generateText({
            model: mistral(MISTRAL_CHAT_MODEL),
            system: systemPrompt,
            messages: [...chatHistory, { role: "user" as const, content: payload.message }],
            tools: {
              search_web: tool({
                description:
                  "Busca en internet (Wikipedia + DuckDuckGo). Para actualidad o verificar hechos.",
                inputSchema: z.object({
                  query: z.string().describe("Consulta en español"),
                }),
                execute: async ({ query }) => searchWeb(query),
              }),
            },
            stopWhen: stepCountIs(4),
            temperature: 0.6,
            abortSignal: AbortSignal.timeout(45_000),
          });

          let content = result.text.trim();
          if (!content) {
            content = "No pude generar una respuesta clara. ¿Puedes reformular tu pregunta?";
          }

          const outputMod = moderateAssistantOutput(content);
          if (!outputMod.allowed) {
            content = outputMod.userMessage;
          }

          await supabase.from("chat_messages").insert({
            thread_id: payload.thread_id,
            role: "assistant",
            content,
          });
          await supabase
            .from("chat_threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", payload.thread_id);

          return jsonResponse({ content });
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") {
            return jsonResponse({ error: "La IA tardó demasiado (45s)." }, 504);
          }
          const message = e instanceof Error ? e.message : "Error desconocido";
          if (message.includes("429")) {
            return jsonResponse({ error: "Demasiadas solicitudes a Mistral." }, 429);
          }
          if (message.includes("401") || message.includes("Unauthorized")) {
            return jsonResponse({ error: "Clave de Mistral inválida." }, 500);
          }
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
