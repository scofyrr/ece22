import { MISTRAL_API_KEY } from "./ai-gateway.server";

export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: string; userMessage: string };

/** Bloqueo por regex — primera línea de defensa (rápido, sin llamar IA). */
const BLOCKED_PATTERNS: { re: RegExp; reason: string }[] = [
  {
    re: /\b(porn(o|ografia|ográfic)|xxx|hentai|onlyfans|nudes?\s+de|mandame\s+nudes|sexo\s+explicito\s+con)\b/i,
    reason: "contenido sexual explícito",
  },
  {
    re: /\b(pedofil|menor\s+desnud|child\s+porn|cp\s+porn|porno\s+infantil)\b/i,
    reason: "contenido que sexualiza menores",
  },
  {
    re: /\b(nigg[aer]?|negr[oa]\s+de\s+mierda|chink|kill\s+all\s+jews|mata\s+a\s+todos\s+los\s+(negros|jud[ií]os|gays))\b/i,
    reason: "discurso de odio",
  },
  {
    re: /\b(voy\s+a\s+(matar|golpear)\s+(al\s+profesor|a\s+mi\s+compa[nñ]ero)|bomba\s+en\s+el\s+colegio)\b/i,
    reason: "incitación a violencia concreta",
  },
];

const BLOCKED_USER_MESSAGE =
  "No puedo ayudar con ese tipo de contenido. Pregúntame sobre estudios, la plataforma o temas educativos.";

export function moderateText(text: string): ModerationResult {
  const normalized = text.normalize("NFC");
  for (const { re, reason } of BLOCKED_PATTERNS) {
    if (re.test(normalized)) {
      return { allowed: false, reason, userMessage: BLOCKED_USER_MESSAGE };
    }
  }
  return { allowed: true };
}

export function moderateUserInput(message: string): ModerationResult {
  return moderateText(message);
}

export function moderateAssistantOutput(text: string): ModerationResult {
  return moderateText(text);
}

// ─────────────────────────────────────────────────────────────
// Moderación IA con Mistral (texto + imagen vía pixtral)
// ─────────────────────────────────────────────────────────────

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

const SYSTEM_MODERATION = `Eres un moderador escolar. Analiza el contenido enviado y responde ÚNICAMENTE con JSON válido de este formato exacto:
{"allowed": boolean, "category": string, "reason": string}

Categorías posibles: "ok", "nsfw", "violence", "hate", "self_harm", "illegal", "off_topic".
- "off_topic" = el contenido no tiene NADA que ver con estudios, colegio, ciencia, cultura, deporte, arte, tecnología, humor sano.
- Debes RECHAZAR: desnudos, contenido sexual, violencia gráfica, odio racial/religioso/homofóbico, drogas ilegales, autolesión, memes NSFW.
- Debes PERMITIR: temas académicos, arte, cultura, deportes, tecnología, humor sano de estudiantes, política discutida civilmente, dudas escolares.
Sé estricto pero razonable. Un simple chiste de estudiantes NO es motivo de bloqueo. Un dibujo de un cuerpo desnudo SÍ lo es.`;

type MistralModResp = {
  choices?: { message?: { content?: string } }[];
};

async function callMistral(body: unknown, timeoutMs = 25_000): Promise<string> {
  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Mistral ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as MistralModResp;
  return j.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseVerdict(raw: string): { allowed: boolean; category: string; reason: string } {
  const clean = raw.replace(/```json\s*|\s*```/g, "").trim();
  try {
    const j = JSON.parse(clean);
    return {
      allowed: !!j.allowed,
      category: String(j.category ?? "unknown"),
      reason: String(j.reason ?? ""),
    };
  } catch {
    // Si la IA no devolvió JSON, ser conservador — bloquear si menciona algo malo.
    const lower = raw.toLowerCase();
    const bad = /(nsfw|sexual|violenc|odio|hate|prohib|inapropi|desnud|no permit)/.test(lower);
    return { allowed: !bad, category: "unknown", reason: bad ? raw.slice(0, 180) : "" };
  }
}

/** Modera texto libre (título + contenido) usando Mistral small. */
export async function moderateTextAI(text: string): Promise<ModerationResult> {
  // Preflight regex
  const rx = moderateText(text);
  if (!rx.allowed) return rx;
  if (!text.trim()) return { allowed: true };

  try {
    const raw = await callMistral({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_MODERATION },
        {
          role: "user",
          content: `Modera el siguiente texto de un estudiante:\n\n"""\n${text.slice(0, 6000)}\n"""`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
    const v = parseVerdict(raw);
    if (v.allowed) return { allowed: true };
    return {
      allowed: false,
      reason: `${v.category}: ${v.reason}`.slice(0, 300),
      userMessage: `Contenido prohibido (${v.category}): ${v.reason || "no cumple las normas."}`,
    };
  } catch (e) {
    // Falla la IA → dejar pasar (regex ya limpió lo grave), no bloquear al alumno por infra.
    console.warn("[moderateTextAI] fallo:", e);
    return { allowed: true };
  }
}

/** Modera una imagen por URL pública usando Pixtral (multimodal). */
export async function moderateImageAI(imageUrl: string): Promise<ModerationResult> {
  if (!imageUrl || !/^https?:\/\//.test(imageUrl)) return { allowed: true };
  try {
    const raw = await callMistral(
      {
        model: "pixtral-12b-2409",
        messages: [
          { role: "system", content: SYSTEM_MODERATION },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen. ¿Es apta para una plataforma escolar de secundaria?",
              },
              { type: "image_url", image_url: imageUrl },
            ],
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      30_000,
    );
    const v = parseVerdict(raw);
    if (v.allowed) return { allowed: true };
    return {
      allowed: false,
      reason: `${v.category}: ${v.reason}`.slice(0, 300),
      userMessage: `Imagen prohibida (${v.category}): ${v.reason || "no cumple las normas escolares."}`,
    };
  } catch (e) {
    console.warn("[moderateImageAI] fallo:", e);
    // Si falla, no bloqueamos — pero avisamos por consola.
    return { allowed: true };
  }
}
