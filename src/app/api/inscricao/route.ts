import { NextResponse } from "next/server";
import { inscricaoSchema } from "@/lib/inscricaoSchema";
import {
  buildEventoIcs,
  CONFIRMATION_EMAIL_MESSAGE,
  CONTACT,
  EVENTO,
  MAIL_FROM,
} from "@/lib/evento";

async function sendEmail(payload: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; content_type: string }[];
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      reply_to: payload.replyTo,
      attachments: payload.attachments,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend respondeu ${response.status}: ${detail}`);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = inscricaoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Dados inválidos." },
      { status: 400 },
    );
  }

  const { nome, empresa, cargo, telefone, email, porte } = parsed.data;

  const leadRows = [
    ["Nome", nome],
    ["Empresa", empresa],
    ["Cargo", cargo],
    ["Telefone", telefone],
    ["E-mail", email],
    ["Quantitativo de funcionários", porte],
  ]
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  const convite = buildEventoIcs({ nome, email });
  const conviteBase64 = Buffer.from(convite, "utf-8").toString("base64");

  try {
    await Promise.all([
      sendEmail({
        to: CONTACT.email,
        subject: `Cadastro evento ${EVENTO.titulo} (Curitiba)`,
        text: leadRows,
        replyTo: email,
      }),
      sendEmail({
        to: email,
        subject: `Inscrição confirmada — ${EVENTO.titulo}`,
        text: CONFIRMATION_EMAIL_MESSAGE,
        replyTo: CONTACT.email,
        attachments: [
          {
            filename: "convite.ics",
            content: conviteBase64,
            content_type: "text/calendar; charset=UTF-8; method=REQUEST",
          },
        ],
      }),
    ]);
  } catch (error) {
    console.error("Falha ao enviar e-mail via Resend:", error);
    return NextResponse.json(
      { ok: false, error: "Falha no envio." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
