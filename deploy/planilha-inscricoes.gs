/**
 * Ponte "landing do evento -> Google Planilhas" — Evento Curitiba
 *
 * Recebe o POST de /api/inscricao e acrescenta uma linha na planilha de
 * inscritos. É o que dá fonte de dados para o Looker Studio: e-mail não é
 * banco, planilha é.
 *
 * Versão enxuta de propósito, comparada com Ferramentas/planilha/AppsScript-
 * Standalone.gs: aqui só existe "acrescentar linha". Não lê, não atualiza, não
 * apaga. A URL fica num servidor na internet, então quanto menos ela souber
 * fazer, menor o estrago se o token vazar.
 *
 * ── Como publicar (uma vez, ~10 minutos) ────────────────────────────────────
 *  1. Crie a planilha no Google Drive da Priorize, com o nome
 *     "Inscrições — Descomplicando a NR-1 (Curitiba)".
 *  2. Renomeie a primeira aba para "Inscrições" e deixe-a vazia (o script
 *     escreve o cabeçalho sozinho na primeira inscrição).
 *  3. script.google.com -> Novo projeto -> nomeie "Inscrições Evento Curitiba".
 *  4. Cole este arquivo inteiro por cima do que vier por padrão.
 *  5. Preencha TOKEN e ID_PLANILHA abaixo.
 *  6. Implantar -> Nova implantação -> engrenagem -> App da Web
 *       Executar como:      Eu
 *       Quem pode acessar:  Qualquer pessoa
 *     Autorize quando o Google pedir (Avançado -> Acessar -> Permitir).
 *  7. Copie a URL que termina em /exec e ponha no .env da VPS como PLANILHA_URL.
 *
 * ⚠️ Mudou este código depois? Não basta salvar. É
 *    Implantar -> Gerenciar implantações -> editar -> Versão: Nova versão.
 *    A URL continua a mesma.
 */

// Senha longa e aleatória. É a única proteção da URL — sem ela, qualquer um
// que descubra o endereço escreve na planilha. Precisa bater com PLANILHA_TOKEN
// no .env da VPS.
var TOKEN = 'COLE_AQUI_UM_TOKEN_LONGO_E_ALEATORIO';

// ID da planilha: o pedaço da URL entre /d/ e /edit
// https://docs.google.com/spreadsheets/d/ESTE_PEDACO_AQUI/edit
var ID_PLANILHA = 'COLE_AQUI_O_ID_DA_PLANILHA';

// Ordem das colunas. A coluna "Data" é carimbada pelo script, não vem do site.
var COLUNAS = [
  'Data',
  'Nome',
  'Empresa',
  'Cargo',
  'Telefone',
  'E-mail',
  'Quantitativo de funcionários',
  'Consentimento LGPD',
  'Origem'
];

function doPost(e) {
  var corpo;
  try {
    corpo = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, erro: 'JSON inválido.' });
  }

  if (corpo.token !== TOKEN) {
    return responder({ ok: false, erro: 'Token inválido.' });
  }

  try {
    var linha = gravar(corpo.aba || 'Inscrições', corpo.dados || {});
    return responder({ ok: true, linha: linha });
  } catch (err) {
    return responder({ ok: false, erro: String(err) });
  }
}

/**
 * GET existe só para o teste do navegador: abrir a URL /exec e ver que o app
 * está no ar. Não grava nada e não aceita token por querystring, porque a
 * querystring fica no histórico e nos logs do Google.
 */
function doGet() {
  return responder({ ok: true, servico: 'Inscrições Evento Curitiba', grava: 'somente via POST' });
}

function gravar(nomeAba, dados) {
  var aba = pegarAba(nomeAba);

  // Date de verdade, não texto: com data em texto o Looker Studio lê a coluna
  // inteira como string e todo gráfico por dia quebra sem avisar.
  // O fuso é o da própria planilha (configure em Arquivo -> Configurações).
  dados['Data'] = new Date();

  var linha = COLUNAS.map(function (coluna) {
    return dados[coluna] !== undefined ? dados[coluna] : '';
  });

  aba.appendRow(linha);
  return aba.getLastRow();
}

/** Cria a aba e o cabeçalho se ainda não existirem — a planilha nasce vazia. */
function pegarAba(nome) {
  var ss = SpreadsheetApp.openById(ID_PLANILHA);
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);

  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS]).setFontWeight('bold');
    aba.setFrozenRows(1);
    aba.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  }
  return aba;
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
