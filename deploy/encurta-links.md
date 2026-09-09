# Encurtador de links (encurta.priorizecorporativa.com.br)

Não é um app separado: é um subdomínio a mais apontando para o mesmo processo
PM2 do `evento-curitiba` (porta 3002). O código já está no repositório
(`src/app/[slug]/route.ts` faz o redirect, `src/app/api/links/route.ts` cria
os links). Este runbook é só o que falta pra ligar o subdomínio.

`[LOCAL]` = seu Windows. `[VPS]` = dentro da sessão SSH.

## 1. Variáveis de ambiente

No `.env.production` da VPS (mesmo arquivo do evento, `/home/deploy/evento-curitiba/.env.production`):

```
LINKS_TOKEN=<gerar com: openssl rand -hex 24>
LINKS_BASE_URL=https://encurta.priorizecorporativa.com.br
```

Depois de editar, reiniciar o processo:

```bash
# [VPS]
cd /home/deploy/evento-curitiba
pm2 restart evento-curitiba
```

## 2. DNS

No painel do domínio (registro.br):

```
Tipo   Nome       Valor
A      encurta    72.61.48.71
```

TTL padrão. Esperar propagar antes do passo 4 (certificado).

## 3. nginx

```bash
# [VPS]
sudo cp deploy/encurta-nginx.conf /etc/nginx/sites-available/encurta-priorize
sudo ln -s /etc/nginx/sites-available/encurta-priorize /etc/nginx/sites-enabled/encurta-priorize
sudo nginx -t
```

Só depois do `nginx -t` passar limpo:

```bash
sudo systemctl reload nginx
```

## 4. Certificado HTTPS

Com o DNS já propagado:

```bash
# [VPS]
sudo certbot certonly --nginx --cert-name encurta-priorize -d encurta.priorizecorporativa.com.br
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Testar

```bash
curl -sI https://encurta.priorizecorporativa.com.br | head -5   # 307 pra "/" (nenhum link ainda)
```

Criar um link:

```bash
curl -s -X POST https://encurta.priorizecorporativa.com.br/api/links \
  -H "Authorization: Bearer <LINKS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ..."}'
```

Responde `{"ok":true,"slug":"o2osk2","shortUrl":"https://encurta.priorizecorporativa.com.br/o2osk2"}`.
Pra escolher o código em vez de sortear, manda `"slug": "reuniao"` no corpo.

Abrir `shortUrl` no navegador e confirmar que redireciona pro destino certo.

Listar todos os links já criados:

```bash
curl -s https://encurta.priorizecorporativa.com.br/api/links \
  -H "Authorization: Bearer <LINKS_TOKEN>"
```

## Sobre o armazenamento

Os links ficam em `data/links.json`, dentro da própria pasta do projeto na
VPS — não é versionado (está no `.gitignore`), e sobrevive normalmente a um
`git pull` porque o deploy nunca roda `git clean`. Fazer backup desse arquivo
de vez em quando (`scp` pra local) se a lista de links crescer e importar.
