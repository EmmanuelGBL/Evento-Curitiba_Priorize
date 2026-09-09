import { NextResponse } from "next/server";
import { buscarLink, registrarClique } from "@/lib/links";

// Rota na raiz de propósito: é o que deixa o link curto sem /r/ no meio
// (ex.: encurta.priorizecorporativa.com.br/o2osk2). Hoje só existe a "/" do
// evento além desta, então não colide — se este app ganhar outras páginas
// soltas na raiz, mover para /r/[slug].
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const link = await buscarLink(slug);

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), { status: 307 });
  }

  // Fogo e esquece: não atrasa o redirect esperando a escrita no disco.
  registrarClique(slug).catch(() => {});

  return NextResponse.redirect(link.url, { status: 302 });
}
