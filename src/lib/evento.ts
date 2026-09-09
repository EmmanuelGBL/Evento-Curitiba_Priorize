/**
 * Constantes do evento "Descomplicando a NR-1", Curitiba/Campo Largo.
 * Datas e formato confirmados na reuniao de 19/08/2026 com a Edianne.
 * Ver Reuniões/2026-08-19/ e a memoria `evento-curitiba-pivot` para o
 * historico completo (o agendamento de visita presencial foi cancelado
 * em 02/09/2026; o cadastro abaixo e so captacao de interesse).
 */

export const SITE_URL = "https://inscricao.priorizecorporativa.com.br";

export const EVENTO = {
  titulo: "Descomplicando a NR-1",
  data: "22 de setembro de 2026",
  horarioBrasilia: "19h30",
  horarioManaus: "18h30",
  formato: "Google Meet",
  publico: "empresas de Curitiba e Campo Largo",
  /** Início em UTC. Curitiba está em UTC-3 o ano todo (sem horário de verão). */
  inicioUTC: "2026-09-22T22:30:00Z",
  /** Duração do convite oficial no Google Meet. Pode acabar passando disso na prática. */
  duracaoMinutos: 60,
} as const;

export const COMPANY = {
  name: "Priorize",
  legalName: "Priorize Saúde Emocional Corporativa",
  tagline: "Saúde Emocional Corporativa",
  crpRegistration:
    "Registrada junto ao Conselho Regional de Psicologia, 20ª Região, sob o nº 505.",
} as const;

export const CONTACT = {
  phoneRaw: "5592985600927",
  email: "contato@priorizecorporativa.com.br",
} as const;

/** Link oficial do Google Meet gerado para o evento (convite de 22/09). */
export const MEET_LINK = "https://meet.google.com/mtw-zqrc-yni";

/**
 * Remetente dos e-mails transacionais (Resend), separado do `contato@` que
 * vive no Titan. Precisa existir como domínio verificado no Resend — não
 * precisa de caixa própria, é só endereço de envio. O ORGANIZER do convite
 * de agenda (.ics) usa o mesmo endereço, para bater com o From: do e-mail.
 */
export const MAIL_FROM_ADDRESS = "inscricoes@priorizecorporativa.com.br";
export const MAIL_FROM = `${EVENTO.titulo} <${MAIL_FROM_ADDRESS}>`;

/**
 * Corpo do e-mail automático que a pessoa recebe assim que se inscreve,
 * enviado pela rota `/api/inscricao` via Resend. É a única confirmação
 * instantânea que ela recebe — guarda o link do Meet, então não
 * personaliza com o nome dela.
 */
export const CONFIRMATION_EMAIL_MESSAGE =
  `Seu cadastro no evento "${EVENTO.titulo}" está confirmado.\n\n` +
  `Data: ${EVENTO.data}\n` +
  `Horário: ${EVENTO.horarioBrasilia} (horário de Brasília)\n` +
  `Link da chamada (Google Meet): ${MEET_LINK}\n` +
  `Adicionar ao Google Agenda: ${googleCalendarUrl()}\n\n` +
  "Guarde este e-mail — é ele que tem o link de acesso. Qualquer dúvida, " +
  "responda este e-mail ou chame no WhatsApp.\n\n" +
  `Equipe ${COMPANY.legalName}`;

/** Formata uma data ISO para o formato exigido pelo Google Agenda (YYYYMMDDTHHMMSSZ). */
function toGoogleCalendarStamp(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Link "adicionar ao Google Agenda" com a data do evento já preenchida. */
export function googleCalendarUrl(): string {
  const inicio = new Date(EVENTO.inicioUTC);
  const fim = new Date(inicio.getTime() + EVENTO.duracaoMinutos * 60_000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${EVENTO.titulo} — evento Priorize`,
    dates: `${toGoogleCalendarStamp(inicio.toISOString())}/${toGoogleCalendarStamp(fim.toISOString())}`,
    details:
      `Evento online da Priorize sobre a NR-1, pelo ${EVENTO.formato}. ` +
      `Link da chamada: ${MEET_LINK}`,
    location: EVENTO.formato,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escapa vírgula, ponto e vírgula, barra invertida e quebra de linha, como o RFC 5545 exige. */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Monta o convite de calendário (.ics, `METHOD:REQUEST`) anexado ao e-mail
 * de confirmação. É o que faz o Gmail/Outlook mostrarem o card de verdade,
 * com "Sim / Talvez / Não", em vez de só um link clicável.
 *
 * UID fixo (não muda por inscrição) porque é o mesmo evento para todo
 * mundo — cada e-mail é um convite individual desse UID para um ATTENDEE
 * diferente. Reenviar para a mesma pessoa com SEQUENCE igual é reenvio do
 * mesmo convite, não um evento novo.
 *
 * ORGANIZER usa `contato@`, não `inscricoes@`: quando alguém clica em
 * "Sim/Talvez/Não" no convite, o Gmail manda a resposta de RSVP direto
 * para o e-mail do organizer. `inscricoes@` é só remetente técnico do
 * Resend, sem caixa de verdade — a resposta bateria e sumiria.
 */
export function buildEventoIcs(attendee: { nome: string; email: string }): string {
  const inicio = new Date(EVENTO.inicioUTC);
  const fim = new Date(inicio.getTime() + EVENTO.duracaoMinutos * 60_000);
  const agora = toGoogleCalendarStamp(new Date().toISOString());

  const descricao = icsEscape(
    `Evento online da Priorize sobre a NR-1, pelo ${EVENTO.formato}. ` +
      `Link da chamada: ${MEET_LINK}`,
  );

  const linhas = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Priorize//Evento Curitiba//PT",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    "UID:evento-descomplicando-nr1-curitiba-2026@priorizecorporativa.com.br",
    `DTSTAMP:${agora}`,
    `DTSTART:${toGoogleCalendarStamp(inicio.toISOString())}`,
    `DTEND:${toGoogleCalendarStamp(fim.toISOString())}`,
    `SUMMARY:${icsEscape(`${EVENTO.titulo} — evento Priorize`)}`,
    `DESCRIPTION:${descricao}`,
    `LOCATION:${icsEscape(MEET_LINK)}`,
    `ORGANIZER;CN=${icsEscape(COMPANY.legalName)}:mailto:${CONTACT.email}`,
    `ATTENDEE;CN=${icsEscape(attendee.nome)};RSVP=TRUE;PARTSTAT=NEEDS-ACTION;ROLE=REQ-PARTICIPANT:mailto:${attendee.email}`,
    // 1 porque o horário mudou de 18h30 para 19h30 de Brasília depois que o
    // convite já tinha saído. Quem recebeu a versão 0 só vê o card atualizar
    // se a SEQUENCE subir. Se o horário mudar de novo, sobe de novo.
    "SEQUENCE:1",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return linhas.join("\r\n");
}

export function whatsappUrl(message?: string): string {
  const text =
    message ??
    `Olá! Me cadastrei para o evento ${EVENTO.titulo} e quero saber mais sobre o levantamento de riscos psicossociais.`;
  return `https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(text)}`;
}

/** Link do site principal, usado no rodapé e na política de privacidade. */
export const SITE_PRINCIPAL_URL = "https://priorizecorporativa.com.br";
