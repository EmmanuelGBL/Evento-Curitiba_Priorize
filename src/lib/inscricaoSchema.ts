import { z } from "zod";

export const inscricaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  empresa: z.string().trim().min(2, "Informe o nome da empresa."),
  cargo: z.string().trim().min(2, "Informe seu cargo."),
  telefone: z
    .string()
    .trim()
    .min(10, "Informe um telefone com DDD.")
    .regex(/^[\d\s()+-]+$/, "Use apenas números, espaços e os sinais ( ) + -"),
  email: z.string().trim().email("Informe um e-mail válido."),
  porte: z.string().min(1, "Selecione o quantitativo de funcionários."),
  consentimento: z.literal(true, {
    message: "É preciso autorizar o contato para enviar.",
  }),
});

export type InscricaoValues = z.infer<typeof inscricaoSchema>;

export const PORTES = [
  "Até 19 funcionários",
  "De 20 a 49 funcionários",
  "De 50 a 99 funcionários",
  "De 100 a 499 funcionários",
  "500 funcionários ou mais",
];
