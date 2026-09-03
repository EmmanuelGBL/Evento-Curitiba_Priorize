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

Ver `.env.example`. Sem configurar nada, o formulário já cai em
`contato@priorizecorporativa.com.br` via FormSubmit — a mesma caixa que recebe o lead
do site principal, com o assunto do e-mail identificando que veio do evento.

## Depois do evento (22/09)

Este projeto tem prazo de validade. Depois da janela do evento, decidir com o Emmanuel
se o subdomínio sai do ar, redireciona para o site principal, ou fica arquivado para um
próximo evento no mesmo formato.
