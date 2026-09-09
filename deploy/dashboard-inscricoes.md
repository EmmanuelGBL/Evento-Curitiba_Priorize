# Lista de inscritos e dashboard no Looker Studio

Como a Priorize passa a ver quem se inscreveu no evento, sem depender de contar
e-mail na caixa do `contato@`.

## ✅ Já feito em 09/09/2026 — Parte 1 e o teste, pulem para a Parte 4

A planilha, o Apps Script e a implantação já existem e foram testados de ponta a
ponta (POST real gravou linha, coluna por coluna, depois apagada). **Falta só a
Parte 4 — montar o relatório no Looker Studio.**

- **Planilha:** `Inscrições — Descomplicando a NR-1 (Curitiba)`, aba `Inscrições`,
  na conta da Priorize (`clinicapriorize.psicologia@gmail...`) —
  [abrir](https://docs.google.com/spreadsheets/d/1utRc07sOzKmFweR3UEisIskyxphCtS3ycNz1VLq64Lg/edit)
- **URL e token:** já estão no `.env.local` do projeto (`PLANILHA_URL`,
  `PLANILHA_TOKEN`). Para produção, copie os dois valores de lá para o `.env` da
  VPS e rode `pm2 restart evento-curitiba --update-env`.

⚠️ **Desvio importante do que a Parte 1 original descrevia:** o Apps Script **não
está** na conta da Priorize. Tentei criar por lá (`Extensões → Apps Script`
dentro da própria planilha) e caiu duas vezes em "Não foi possível abrir o
arquivo" — a conta da Priorize parece ter o Apps Script bloqueado/restrito
(comum em conta Google com alguma política aplicada). A saída, decidida com o
Emmanuel: o script roda na conta **pessoal** dele (`emmanuelgblz@gmail.com`),
e a planilha da Priorize foi **compartilhada com essa conta como Editor** para
o script conseguir escrever nela.

**Efeito prático:** quem precisar reimplantar ou editar o script entra por
`script.google.com` já logado como `emmanuelgblz@gmail.com`, não pela conta da
Priorize. Se um dia o bloqueio da conta Priorize for resolvido, dá para migrar
— mas não é urgente, o dado sempre morou na planilha da Priorize, o script é só
o "motor" de gravação.

Se for investigar esse bloqueio: é o tipo de restrição que um admin de Workspace
configura em "Apps Script" nas configurações de segurança do domínio. Como a
conta da Priorize é um Gmail comum (não parece Workspace), pode ser também uma
política nova do Google para contas novas/pequenas — não confirmado.

## Por que precisa de planilha no meio

O Looker Studio não lê caixa de e-mail. Ele lê fonte de dados — planilha, banco,
GA4 —, e hoje a inscrição só virava dois e-mails do Resend e sumia. A planilha é
a fonte mais barata que existe: é nativa no Looker, custa zero, e a Priorize já
consegue enxergar a lista mesmo antes de qualquer gráfico existir.

O caminho fica assim:

```
formulário  ->  /api/inscricao  ->  e-mail para contato@ (Resend)
                                ->  e-mail de confirmação para quem se inscreveu
                                ->  linha na planilha (Apps Script)  ->  Looker Studio
```

A gravação na planilha roda **fora** do bloco que envia e-mail. Se o Resend cair,
o lead ainda entra na planilha; se a planilha cair, o e-mail ainda sai. As duas
pontas teriam que falhar juntas para o cadastro se perder.

---

## Parte 1 — a planilha (~10 minutos, uma vez)

1. **Crie a planilha** no Drive, com o nome
   `Inscrições — Descomplicando a NR-1 (Curitiba)`.
2. Renomeie a primeira aba para `Inscrições` e **deixe vazia**. O script escreve o
   cabeçalho sozinho na primeira inscrição que chegar.
3. Em **Arquivo → Configurações**, confira o **fuso horário**. É ele que define o
   horário gravado em cada linha. O evento roda em horário de Brasília, mas quem lê
   a planilha está em Manaus — escolha um e não mude depois, senão as linhas antigas
   e as novas passam a contar horas diferentes.
4. Abra `script.google.com` → **Novo projeto**, nome `Inscrições Evento Curitiba`.
5. Cole o conteúdo de **`planilha-inscricoes.gs`** (mesma pasta deste arquivo) por
   cima do `function myFunction() {}` que vem por padrão.
6. Preencha no topo:
   - `TOKEN` — senha longa e aleatória, no padrão `prz_` + caracteres aleatórios.
     É a única proteção da URL.
   - `ID_PLANILHA` — o pedaço da URL da planilha entre `/d/` e `/edit`.
7. **Implantar → Nova implantação → ⚙ → App da Web**:

   | Campo | Valor |
   |---|---|
   | Executar como | **Eu** |
   | Quem pode acessar | **Qualquer pessoa** |

   Na primeira vez o Google pede autorização: *Revisar permissões → sua conta →
   "não foi verificado pelo Google" → Avançado → Acessar → Permitir*. É esperado —
   o app é seu, rodando na sua conta.

8. Copie a **URL que termina em `/exec`**.

> ⚠️ "Qualquer pessoa" quer dizer que a URL não pede login do Google. Ela continua
> secreta e protegida pelo token: sem o token, o script responde `Token inválido`
> e não grava nada. Não coloque essa URL em nenhum arquivo que vá para o GitHub.

## Parte 2 — ligar o site na planilha

No `.env` do projeto na VPS (`/home/deploy/evento-curitiba/.env`), acrescente:

```
PLANILHA_URL=https://script.google.com/macros/s/AKfy.../exec
PLANILHA_TOKEN=prz_o_mesmo_token_do_script
```

E reinicie o processo:

```bash
pm2 restart evento-curitiba --update-env
```

**Teste antes de confiar:** faça uma inscrição de verdade no site com um e-mail seu.
Tem que acontecer tudo: os dois e-mails chegam **e** a linha aparece na planilha.
Depois apague a linha de teste.

Se o e-mail chegar e a linha não aparecer, o erro está no log:

```bash
pm2 logs evento-curitiba --lines 50
```

`Token inválido` = o token do `.env` não bate com o do script. `Aba não encontrada`
não acontece (o script cria a aba), mas nome de aba com acento trocado gera uma aba
nova em branco — confira se não nasceram duas.

## Parte 3 — as inscrições que já chegaram por e-mail

O que entrou antes disso existe só na caixa do `contato@` e **não vai aparecer
sozinho** na planilha. Não há como recuperar retroativamente: procure no Gmail por
`assunto: Cadastro evento Descomplicando a NR-1` e digite essas linhas à mão. Como
são poucas, é mais rápido do que qualquer importação.

---

## Parte 4 — o dashboard no Looker Studio

Com a planilha recebendo linha, o dashboard sai em 15 minutos.

1. `lookerstudio.google.com` → **Criar → Relatório** → conector **Planilhas Google**
   → escolha a planilha e a aba `Inscrições` → **Adicionar**.
2. Confirme os tipos de campo na fonte de dados: `Data` precisa aparecer como
   **Data e hora**, não como Texto. Se estiver como texto, a coluna foi gravada
   errado — reveja o passo 3 da Parte 1.

### O que colocar, e por quê

| Peça | Tipo no Looker | Para quê |
|---|---|---|
| **Total de inscritos** | Cartão de pontuação, métrica `Registros` | o número que a Edianne vai perguntar |
| **Inscrições por dia** | Gráfico de série temporal, dimensão `Data` | mostra se a divulgação está surtindo efeito ou parou |
| **Por quantitativo de funcionários** | Gráfico de barras, dimensão `Quantitativo de funcionários` | separa empresa de porte real de curioso |
| **Lista completa** | Tabela: Data · Nome · Empresa · Cargo · Telefone · E-mail | é o que elas mais vão usar, para ligar |

Ordene a tabela por `Data` decrescente, para o inscrito mais recente ficar no topo.

### Compartilhar com a Priorize

**Compartilhar → adicionar os e-mails da Edianne e da Ascensão como Leitor.**

Não use "qualquer pessoa com o link". A tabela tem nome, telefone e e-mail
corporativo de gente que se inscreveu num evento — não é dado sensível de saúde,
mas é dado pessoal sob a LGPD, e link aberto dispensa qualquer controle de quem viu.
Pelo mesmo motivo, compartilhe a **planilha** só com quem precisa editar.

> A atualização não é instantânea: o Looker guarda cache de até 15 minutos para
> Planilhas. Quem estiver olhando na hora de uma inscrição pode ter que clicar em
> **Atualizar dados** (⟳, canto superior direito). Vale avisar elas disso, senão
> parece que o painel está quebrado.

---

## Sobre a alternativa: um link `/inscritos` no próprio site

Dá para fazer — uma página com senha, listando os inscritos direto de um banco na
VPS. Fica mais bonito, com a marca da Priorize, e sem cache de 15 minutos.

Não compensa **para este evento**: exige banco, tela de login e mais uma coisa para
manter no ar, para um subdomínio que tem prazo de validade em 22/09. Planilha +
Looker entrega a mesma informação hoje, sem código novo em produção.

A tela própria é a resposta certa na **Fase 2**, dentro do Sistema, onde o lead entra
com responsável, situação e histórico, e a planilha sai de cena. Enquanto o Sistema
não estiver em pé, o dashboard do Looker cobre o buraco.
