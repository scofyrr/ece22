import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { moderateTextAI, moderateImageAI } from "./ai-moderation.server";

const postSchema = z.object({
  title: z.string().max(400),
  content: z.string().max(30000),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

/** Modera un post antes de publicarlo. */
export const moderatePostServer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => postSchema.parse(input))
  .handler(async ({ data }) => {
    const [textVerdict, imgVerdict] = await Promise.all([
      moderateTextAI(`${data.title}\n\n${data.content}`),
      data.imageUrl
        ? moderateImageAI(data.imageUrl)
        : Promise.resolve({ allowed: true } as const),
    ]);
    if (!textVerdict.allowed)
      return { allowed: false as const, message: textVerdict.userMessage };
    if (!imgVerdict.allowed)
      return { allowed: false as const, message: imgVerdict.userMessage };
    return { allowed: true as const };
  });

const bookSchema = z.object({
  title: z.string().max(300),
  author: z.string().max(200).optional().default(""),
  description: z.string().max(3000).optional().default(""),
  coverUrl: z.string().url().optional().or(z.literal("")),
});

/** Modera un libro (metadatos + portada) antes de publicarlo. */
export const moderateBookServer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookSchema.parse(input))
  .handler(async ({ data }) => {
    const meta = `Título: ${data.title}\nAutor: ${data.author}\nDescripción: ${data.description}`;
    const [textVerdict, imgVerdict] = await Promise.all([
      moderateTextAI(meta),
      data.coverUrl
        ? moderateImageAI(data.coverUrl)
        : Promise.resolve({ allowed: true } as const),
    ]);
    if (!textVerdict.allowed)
      return { allowed: false as const, message: textVerdict.userMessage };
    if (!imgVerdict.allowed)
      return { allowed: false as const, message: imgVerdict.userMessage };
    return { allowed: true as const };
  });
