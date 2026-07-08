export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: string; userMessage: string };

/** Solo bloquea contenido claramente prohibido — no preguntas históricas/educativas. */
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
