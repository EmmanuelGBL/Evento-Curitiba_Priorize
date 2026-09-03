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
  horarioBrasilia: "18h30",
  horarioManaus: "19h30",
  formato: "Google Meet",
  publico: "empresas de Curitiba e Campo Largo",
  /** Início em UTC. Curitiba está em UTC-3 o ano todo (sem horário de verão). */
  inicioUTC: "2026-09-22T21:30:00Z",
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
 * precisa de caixa própria, é só endereço de envio.
 */
export const MAIL_FROM = `${EVENTO.titulo} <inscricoes@priorizecorporativa.com.br>`;

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
  `Link da chamada (Google Meet): ${MEET_LINK}\n\n` +
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

export function whatsappUrl(message?: string): string {
  const text =
    message ??
    `Olá! Me cadastrei para o evento ${EVENTO.titulo} e quero saber mais sobre o levantamento de riscos psicossociais.`;
  return `https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent(text)}`;
}

/** Link do site principal, usado no rodapé e na política de privacidade. */
export const SITE_PRINCIPAL_URL = "https://priorizecorporativa.com.br";
