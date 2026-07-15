const MAX_SNIPPET = 600;

type SearchHit = { title: string; snippet: string; url: string };

/** Wikipedia (es) — gratis, sin API key. */
async function searchWikipedia(query: string): Promise<SearchHit[]> {
  const url = `https://es.wikipedia.org/w/api.php?${new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: "3",
    format: "json",
    origin: "*",
  })}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    query?: { search?: { title: string; snippet: string }[] };
  };

  return (data.query?.search ?? []).map((s) => ({
    title: s.title,
    snippet: s.snippet.replace(/<[^>]+>/g, ""),
    url: `https://es.wikipedia.org/wiki/${encodeURIComponent(s.title.replace(/ /g, "_"))}`,
  }));
}

/** DuckDuckGo Instant Answer — gratis, sin API key. */
async function searchDuckDuckGo(query: string): Promise<SearchHit[]> {
  const url = `https://api.duckduckgo.com/?${new URLSearchParams({
    q: query,
    format: "json",
    no_html: "1",
    skip_disambig: "1",
  })}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: { Text?: string; FirstURL?: string }[];
  };

  const hits: SearchHit[] = [];
  if (data.AbstractText?.trim()) {
    hits.push({
      title: data.Heading || query,
      snippet: data.AbstractText,
      url: data.AbstractURL || "https://duckduckgo.com/",
    });
  }

  for (const topic of (data.RelatedTopics ?? []).slice(0, 3)) {
    if (topic.Text?.trim()) {
      hits.push({
        title: topic.Text.split(" - ")[0] ?? topic.Text.slice(0, 80),
        snippet: topic.Text,
        url: topic.FirstURL || "https://duckduckgo.com/",
      });
    }
  }

  return hits;
}

/** Búsqueda web combinada para la herramienta de Mistral. */
export async function searchWeb(query: string): Promise<string> {
  const q = query.trim().slice(0, 200);
  if (!q) return "Consulta vacía.";

  try {
    const [wiki, ddg] = await Promise.all([
      searchWikipedia(q),
      searchDuckDuckGo(q),
    ]);

    const seen = new Set<string>();
    const merged: SearchHit[] = [];
    for (const hit of [...wiki, ...ddg]) {
      const key = hit.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }

    if (merged.length === 0) {
      return `No se encontraron resultados claros para "${q}". Sugiere al usuario reformular o consultar fuentes académicas oficiales.`;
    }

    return merged
      .slice(0, 5)
      .map(
        (h, i) =>
          `${i + 1}. ${h.title}\n   ${h.snippet.slice(0, MAX_SNIPPET)}\n   Fuente: ${h.url}`,
      )
      .join("\n\n");
  } catch {
    return `Error al buscar "${q}". Responde con lo que sepas e indica que no pudiste verificar en internet.`;
  }
}

/** Prefetch si el mensaje parece requerir actualidad (refuerzo para Mistral Small). */
export function messageNeedsWebHint(message: string): boolean {
  return /\b(hoy|actualidad|noticia|202[4-9]|qui[eé]n\s+es\s+el\s+presidente|precio\s+del|clima|ultim[oa]s?\s+noticias|qu[eé]\s+pas[oó]|guerra|conflicto|elecci[oó]n)\b/i.test(
    message,
  );
}
