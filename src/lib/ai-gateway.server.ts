import { createMistral } from "@ai-sdk/mistral";

/** Clave API de Mistral — https://console.mistral.ai */
export const MISTRAL_API_KEY = "1nJppseq4KXSwD6S9y6AvZlAACP8Try9";

/** Modelo gratuito Mistral Small */
export const MISTRAL_CHAT_MODEL = "mistral-small-latest";

/** Cliente Mistral — endpoint https://api.mistral.ai/v1 */
export const mistral = createMistral({ apiKey: MISTRAL_API_KEY });
