import Image from "next/image";
import { CalendarDays, Clock, Video } from "lucide-react";
import { InscricaoForm } from "@/components/InscricaoForm";
import { COMPANY, EVENTO, SITE_PRINCIPAL_URL } from "@/lib/evento";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Marca d'agua desativada: Emmanuel achou feia. Assets ficam em
        public/brand/watermark-vertical.png e scripts/gerar-watermark.py
        se quiser reativar depois.
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/brand/watermark-vertical.png?v=3')",
          backgroundRepeat: "repeat",
          backgroundSize: "330px 324px",
        }}
      />
      */}

      {/* brilho suave da marca por tras do cabecalho e do hero juntos, para
          nao ter corte seco entre um cabecalho branco e o resto colorido */}
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

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Evento online para {EVENTO.publico}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Descomplicando a <span className="text-brand-600">NR-1</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              A Priorize explica, em uma conversa direta pelo {EVENTO.formato}, o
              que muda para a sua empresa com a NR-1 e como funciona o
              levantamento de riscos psicossociais.
            </p>

            <dl className="mx-auto mt-8 grid max-w-md gap-4 text-left sm:grid-cols-1 lg:mx-0">
              <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                <CalendarDays className="shrink-0 text-brand-600" size={20} aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Data
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{EVENTO.data}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                <Clock className="shrink-0 text-brand-600" size={20} aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Horário
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    {EVENTO.horarioBrasilia} (horário de Brasília)
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                <Video className="shrink-0 text-brand-600" size={20} aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Formato
                  </dt>
                  <dd className="text-sm font-semibold text-ink">
                    Online, pelo {EVENTO.formato}. O link é enviado após o cadastro.
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="relative rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-950/5 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Cadastre sua empresa
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Preencha os dados abaixo para participar. Se quiser seguir com o
                levantamento depois do evento, o serviço é implementado de
                forma remota, sem precisar de visita presencial.
              </p>
              <div className="mt-6">
                <InscricaoForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-brand-900 px-6 py-3 text-center text-xs text-brand-200">
        <p>{COMPANY.crpRegistration}</p>
        <p className="mt-1">
          <a href={SITE_PRINCIPAL_URL} className="text-white underline underline-offset-2 hover:text-lime-accent">
            {COMPANY.legalName}
          </a>
        </p>
      </footer>
    </div>
  );
}
