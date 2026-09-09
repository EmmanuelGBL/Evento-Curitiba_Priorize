import { NextResponse } from "next/server";
import { criarLinkSchema } from "@/lib/linksSchema";
import { criarLink, listarLinks } from "@/lib/links";

// Sem token configurado o endpoint fica fechado por padrão — assim ninguém
// cria redirecionamento sem querer só porque esqueceram de setar a env var.
function autorizado(request: Request): boolean {
  const token = process.env.LINKS_TOKEN;
  if (!token) return false;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = criarLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const { slug } = await criarLink(parsed.data.url, parsed.data.slug);
    const base = process.env.LINKS_BASE_URL ?? new URL(request.url).origin;
    return NextResponse.json({ ok: true, slug, shortUrl: `${base}/${slug}` });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao criar o link." },
      { status: 409 },
    );
  }
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  const links = await listarLinks();
  return NextResponse.json({ ok: true, links });
}
