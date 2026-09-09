import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/**
 * Encurtador de links próprio: guarda os slugs num JSON no disco da VPS.
 * Existe pra não depender de Bitly/Rebrandly/etc — a Priorize não paga nada
 * e o link some se ela mesma decidir tirar o domínio do ar, não se um
 * terceiro descontinuar o plano grátis.
 *
 * O arquivo fica fora do git (.gitignore) e sobrevive a `git pull` porque o
 * deploy nunca roda `git clean` — só `pull` + `build` + `pm2 restart`
 * (ver deploy/primeiro-deploy.md).
 */

const ARQUIVO = path.join(process.cwd(), "data", "links.json");

export type Link = {
  url: string;
  criadoEm: string;
  cliques: number;
};

type Banco = Record<string, Link>;

async function ler(): Promise<Banco> {
  try {
    const conteudo = await readFile(ARQUIVO, "utf-8");
    return JSON.parse(conteudo) as Banco;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function salvar(banco: Banco): Promise<void> {
  await mkdir(path.dirname(ARQUIVO), { recursive: true });
  await writeFile(ARQUIVO, JSON.stringify(banco, null, 2), "utf-8");
}

// Sem 0/O, 1/l/I: código lido em voz alta ou digitado à mão não confunde.
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

function gerarSlug(tamanho = 6): string {
  const bytes = randomBytes(tamanho);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export async function criarLink(
  url: string,
  slugDesejado?: string,
): Promise<{ slug: string; link: Link }> {
  const banco = await ler();

  if (slugDesejado) {
    if (banco[slugDesejado]) {
      throw new Error("Esse código já está em uso.");
    }
    const link: Link = { url, criadoEm: new Date().toISOString(), cliques: 0 };
    banco[slugDesejado] = link;
    await salvar(banco);
    return { slug: slugDesejado, link };
  }

  // 33 símbolos ^ 6 posições: colisão é desprezível, mas o banco cresce com
  // o tempo, então tenta algumas vezes em vez de assumir que sempre é livre.
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const slug = gerarSlug();
    if (!banco[slug]) {
      const link: Link = { url, criadoEm: new Date().toISOString(), cliques: 0 };
      banco[slug] = link;
      await salvar(banco);
      return { slug, link };
    }
  }

  throw new Error("Não consegui gerar um código livre. Tente de novo.");
}

export async function buscarLink(slug: string): Promise<Link | null> {
  const banco = await ler();
  return banco[slug] ?? null;
}

export async function registrarClique(slug: string): Promise<void> {
  const banco = await ler();
  if (banco[slug]) {
    banco[slug].cliques += 1;
    await salvar(banco);
  }
}

export async function listarLinks(): Promise<Banco> {
  return ler();
}
