# Evento Curitiba — cadastro

Landing page de cadastro para o evento "Descomplicando a NR-1" (22/09/2026), voltado a
empresas de Curitiba e Campo Largo. Projeto separado do `Site/` de propósito: é uma
campanha com prazo curto, vive em subdomínio próprio e não deve competir por SEO com o
site institucional. Contexto completo da decisão em
`Reuniões/2026-08-19/` e na memória `evento-curitiba-pivot`.

**Não tem agendamento de visita.** Isso foi cancelado em 02/09/2026 — o cadastro só
captura o lead; se a empresa quiser seguir, o levantamento é feito remoto, igual à
proposta do site principal.

## Rodar localmente

```bash
npm install
npm run dev
```

## Onde publica

`inscricao.priorizecorporativa.com.br`, na mesma VPS que hospeda o `Site/`, como
processo separado (porta 3002, outro bloco de nginx, outro ciclo de deploy). Passo a passo
completo do primeiro deploy em `deploy/primeiro-deploy.md`; os `.conf` e o `ecosystem.config.js`
prontos para copiar estão na mesma pasta.

## Variáveis de ambiente

Ver `.env.example`. O envio não usa mais FormSubmit: a rota `/api/inscricao` manda os
dois e-mails pelo Resend (o lead para `contato@priorizecorporativa.com.br` e a
confirmação com o convite `.ics` para quem se inscreveu), então **sem `RESEND_API_KEY`
o cadastro falha**.

## Lista de inscritos e dashboard

Cada inscrição também é gravada numa Google Planilha, que é a fonte que o Looker Studio
lê para o painel da Priorize. Passo a passo completo — publicar o Apps Script, ligar o
`.env` e montar o dashboard — em `deploy/dashboard-inscricoes.md`. Sem
`PLANILHA_URL`/`PLANILHA_TOKEN` o site funciona igual, só não acumula a lista.

## Depois do evento (22/09)

Este projeto tem prazo de validade. Depois da janela do evento, decidir com o Emmanuel
se o subdomínio sai do ar, redireciona para o site principal, ou fica arquivado para um
próximo evento no mesmo formato.
