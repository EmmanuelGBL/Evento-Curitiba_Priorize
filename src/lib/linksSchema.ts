import { z } from "zod";

export const criarLinkSchema = z.object({
  url: z.string().trim().url("Informe uma URL válida, com https://."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,32}$/, "Use só letras minúsculas, números e hífen (3 a 32 caracteres).")
    .optional(),
});

export type CriarLinkValues = z.infer<typeof criarLinkSchema>;
