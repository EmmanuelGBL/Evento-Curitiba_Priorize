"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, CheckCircle2, Loader2, Send } from "lucide-react";
import { inscricaoSchema, PORTES, type InscricaoValues } from "@/lib/inscricaoSchema";
import { EVENTO, googleCalendarUrl, whatsappUrl } from "@/lib/evento";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-base text-ink " +
  "placeholder:text-ink-soft/60 focus:border-brand-600 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export function InscricaoForm() {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InscricaoValues>({ resolver: zodResolver(inscricaoSchema) });

  async function onSubmit(values: InscricaoValues) {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Falha no envio");

      reset();
      setSuccess(true);
    } catch {
      setErrorMessage(
        "Não conseguimos enviar seu cadastro agora. Tente novamente em instantes ou fale direto no WhatsApp.",
      );
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center sm:p-8">
        <CheckCircle2
          size={44}
          className="mx-auto text-brand-600"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
          Cadastro recebido
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Sua vaga no {EVENTO.titulo} está confirmada, dia {EVENTO.data} às{" "}
          {EVENTO.horarioBrasilia} (horário de Brasília).
        </p>
        <a
          href={googleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700"
        >
          <CalendarPlus size={18} aria-hidden="true" />
          Adicionar {EVENTO.titulo} ao Google Agenda
        </a>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          O link da chamada também acaba de chegar no seu e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
        className="w-full cursor-pointer rounded-lg border-2 border-brand-600 bg-white px-6 py-3 text-base font-semibold text-brand-600 transition-all hover:bg-brand-600 hover:text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
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

      {errorMessage ? (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}{" "}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Abrir o WhatsApp
          </a>
        </div>
      ) : null}
    </form>
  );
}
