import Image from "next/image";
import { CalendarPlus, CheckCircle2, Globe } from "lucide-react";
import { COMPANY, EVENTO, SITE_PRINCIPAL_URL, googleCalendarUrl } from "@/lib/evento";

export const metadata = {
  title: `Cadastro confirmado | ${EVENTO.titulo}`,
  robots: { index: false, follow: false },
};

export default function InscricaoConfirmada() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(60%_55%_at_50%_0%,var(--color-brand-50)_0%,transparent_70%)]"
      />

      <header>
        <div className="mx-auto flex max-w-5xl items-end justify-center gap-3 px-6 py-2 sm:py-2.5">
          <Image
            src="/brand/logo-arvore.png"
            alt=""
            aria-hidden="true"
            width={661}
            height={631}
            priority
            className="h-14 w-auto sm:h-16"
          />
          <span className="flex flex-col">
            <Image
              src="/brand/logo-wordmark.png"
              alt={`${COMPANY.name} ${COMPANY.tagline}`}
              width={880}
              height={159}
              priority
              className="h-7 w-auto self-start sm:h-8"
            />
            <span
              aria-hidden="true"
              className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase leading-none tracking-[0.01em] text-brand-600 sm:text-[10px]"
            >
              {COMPANY.tagline}
            </span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center sm:p-8">
          <CheckCircle2
            size={44}
            className="mx-auto text-brand-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            Cadastro recebido
          </h1>
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
          <a
            href={SITE_PRINCIPAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-600 bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
          >
            <Globe size={18} aria-hidden="true" />
            Conheça nosso site
          </a>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            O link da chamada também acaba de chegar no seu e-mail.
          </p>
        </div>
      </main>
    </div>
  );
}
