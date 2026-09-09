/**
 * Grava a inscrição numa Google Planilha, via App da Web do Apps Script.
 * O código que roda do outro lado está em `deploy/planilha-inscricoes.gs`.
 *
 * Existe por um motivo só: o e-mail avisa, mas não acumula. Sem uma linha
 * gravada não há lista de inscritos, não há contagem e não há Looker Studio
 * — a Priorize teria que contar e-mail na caixa. A planilha é a fonte que o
 * dashboard lê.
 *
 * ⚠️ Esta gravação NUNCA pode derrubar a inscrição. O e-mail é a garantia de
 * que o lead chegou; a planilha é conveniência. Por isso toda falha aqui é
 * engolida e vira log, não erro para quem se inscreveu.
 */

const TIMEOUT_MS = 8_000;

export type LinhaInscricao = {
  Nome: string;
  Empresa: string;
  Cargo: string;
  Telefone: string;
  "E-mail": string;
  "Quantitativo de funcionários": string;
  "Consentimento LGPD": string;
  Origem: string;
};

export async function registrarNaPlanilha(linha: LinhaInscricao): Promise<void> {
  const url = process.env.PLANILHA_URL;
  const token = process.env.PLANILHA_TOKEN;

  if (!url || !token) {
    // Ambiente sem planilha configurada (dev, ou antes de publicar o script).
    // Não é erro: o e-mail continua saindo normalmente.
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        aba: process.env.PLANILHA_ABA || "Inscrições",
        dados: linha,
      }),
      signal: controller.signal,
      // O Apps Script responde 302 para o script.googleusercontent.com que
      // carrega o JSON de verdade. Sem seguir o redirect, a resposta vem vazia.
      redirect: "follow",
    });

    const corpo = await response.text();

    // O Apps Script devolve 200 mesmo quando recusa (token errado, aba que não
    // existe). Quem diz se deu certo é o `ok` do JSON, não o status HTTP.
    if (!response.ok || !corpo.includes('"ok":true')) {
      console.error("Planilha recusou a inscrição:", response.status, corpo.slice(0, 300));
    }
  } catch (error) {
    console.error("Falha ao gravar inscrição na planilha:", error);
  } finally {
    clearTimeout(timeout);
  }
}
