"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import {
  CONFIRMATION_EMAIL_MESSAGE,
  EVENTO,
  FORM_ENDPOINT,
  SITE_URL,
  whatsappUrl,
} from "@/lib/evento";

const schema = z.object({
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

type FormValues = z.infer<typeof schema>;

const PORTES = [
  "Até 19 funcionários",
  "De 20 a 49 funcionários",
  "De 50 a 99 funcionários",
  "De 100 a 499 funcionários",
  "500 funcionários ou mais",
];

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-ink " +
  "placeholder:text-ink-soft/60 focus:border-brand-600 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export function InscricaoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onValid(_values: FormValues, event?: React.BaseSyntheticEvent) {
    // Envio nativo (não fetch): é o único jeito do FormSubmit disparar o
    // `_autoresponse` com o link do Meet para quem se inscreve. O
    // handleSubmit do react-hook-form já bloqueou o submit automático do
    // navegador; aqui disparamos manualmente com os campos já validados.
    (event?.target as HTMLFormElement | undefined)?.submit();
  }

  return (
    <form
      action={FORM_ENDPOINT}
      method="POST"
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="space-y-5"
    >
      <input type="hidden" name="_subject" value={`Cadastro evento ${EVENTO.titulo} (Curitiba)`} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value={`${SITE_URL}/inscricao-confirmada`} />
      <input type="hidden" name="_autoresponse" value={CONFIRMATION_EMAIL_MESSAGE} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            className={fieldClass}
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? "erro-nome" : undefined}
            {...register("nome")}
          />
          {errors.nome ? (
            <p id="erro-nome" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.nome.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="empresa">
            Empresa
          </label>
          <input
            id="empresa"
            type="text"
            autoComplete="organization"
            placeholder="Nome da empresa"
            className={fieldClass}
            aria-invalid={!!errors.empresa}
            aria-describedby={errors.empresa ? "erro-empresa" : undefined}
            {...register("empresa")}
          />
          {errors.empresa ? (
            <p id="erro-empresa" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.empresa.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="cargo">
            Seu cargo
          </label>
          <input
            id="cargo"
            type="text"
            autoComplete="organization-title"
            placeholder="Sócio, RH, SESMT..."
            className={fieldClass}
            aria-invalid={!!errors.cargo}
            aria-describedby={errors.cargo ? "erro-cargo" : undefined}
            {...register("cargo")}
          />
          {errors.cargo ? (
            <p id="erro-cargo" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.cargo.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="telefone">
            Telefone ou WhatsApp
          </label>
          <input
            id="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(41) 90000-0000"
            className={fieldClass}
            aria-invalid={!!errors.telefone}
            aria-describedby={errors.telefone ? "erro-telefone" : undefined}
            {...register("telefone")}
          />
          {errors.telefone ? (
            <p id="erro-telefone" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.telefone.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="email">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@suaempresa.com.br"
            className={fieldClass}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "erro-email" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="erro-email" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="porte">
            Quantitativo de funcionários
          </label>
          <select
            id="porte"
            className={fieldClass}
            defaultValue=""
            aria-invalid={!!errors.porte}
            aria-describedby={errors.porte ? "erro-porte" : undefined}
            {...register("porte")}
          >
            <option value="" disabled>
              Selecione
            </option>
            {PORTES.map((porte) => (
              <option key={porte} value={porte}>
                {porte}
              </option>
            ))}
          </select>
          {errors.porte ? (
            <p id="erro-porte" role="alert" className="mt-1.5 text-sm text-red-700">
              {errors.porte.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-300 accent-brand-600"
            aria-invalid={!!errors.consentimento}
            {...register("consentimento")}
          />
          <span>
            Autorizo a Priorize a entrar em contato comigo sobre esta
            solicitação.
          </span>
        </label>
        {errors.consentimento ? (
          <p role="alert" className="mt-1.5 text-sm text-red-700">
            {errors.consentimento.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg border-2 border-brand-600 bg-white px-6 py-3 text-base font-semibold text-brand-600 transition-all hover:bg-brand-600 hover:text-white hover:shadow-lg disabled:opacity-70"
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" />
              Confirmar cadastro
            </>
          )}
        </span>
      </button>

      <p className="text-center text-xs text-ink-soft">
        Prefere falar direto?{" "}
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          Chame no WhatsApp
        </a>
      </p>
    </form>
  );
}
