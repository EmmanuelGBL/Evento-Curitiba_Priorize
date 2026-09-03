# Primeiro deploy do Evento-Curitiba

VPS `72.61.48.71` (`srv1121242.hstgr.cloud`), a mesma que já roda o `Site/` e o `Sistema/`.
Mesmo padrão do site principal (`Site/deploy/README.md`), adaptado para o primeiro deploy —
aqui ainda não existe repositório nem processo PM2.

`[LOCAL]` = seu Windows. `[VPS]` = dentro da sessão SSH.

## 0. Confirmar a porta livre

A 3000 é o "patinhas", a 3001 é o "priorize-site". Este runbook assume **3002**.

```bash
# [VPS]
ss -tln | grep 3002
```

Se já estiver em uso, escolha outra e ajuste `deploy/ecosystem.config.js` e
`deploy/nginx.conf` antes de seguir.

## 1. Criar o repositório e a deploy key

Mesma lógica de `Site` e `Sistema`: repositório próprio, privado, na organização da
Priorize, com uma chave de deploy dedicada (não reaproveitar `priorize_site_deploy`).

```bash
# [LOCAL], dentro de Evento-Curitiba/
git init
git add .
git commit -m "Primeira versão: cadastro do evento Descomplicando a NR-1"
```

Criar o repositório vazio no GitHub, na organização da Priorize (nome sugerido:
`evento-curitiba` ou `Evento-Curitiba-Priorize`, para bater com o padrão dos outros dois).

```bash
# [VPS] — gerar a chave, sem senha, com comentário identificando o repositório
ssh-keygen -t ed25519 -C "deploy@evento-curitiba" -f ~/.ssh/evento_curitiba_deploy -N ""
cat ~/.ssh/evento_curitiba_deploy.pub
```

Colar essa chave pública em **Settings → Deploy keys** do repositório novo, no GitHub, com
permissão só de leitura.

```bash
# [LOCAL]
git remote add origin git@github.com:<org-priorize>/evento-curitiba.git
git push -u origin main
```

## 2. Clonar na VPS

```bash
# [VPS]
cd /home/deploy
GIT_SSH_COMMAND='ssh -i ~/.ssh/evento_curitiba_deploy -o IdentitiesOnly=yes' \
  git clone git@github.com:<org-priorize>/evento-curitiba.git evento-curitiba
cd evento-curitiba
```

**Fixar a chave para os próximos `git pull`**, para não cair no mesmo problema que o
`priorize-site` teve (`ERROR: Repository not found` por usar a chave padrão errada):

```bash
# [VPS], dentro de /home/deploy/evento-curitiba
git config core.sshCommand 'ssh -i ~/.ssh/evento_curitiba_deploy -o IdentitiesOnly=yes'
```

## 3. Variável de ambiente

```bash
# [VPS], dentro de /home/deploy/evento-curitiba
cp .env.example .env.production
```

Sem editar nada, já cai em `contato@priorizecorporativa.com.br`. Só mexer se quiser outro
destino para o lead do evento.

## 4. Instalar, buildar e subir no PM2

```bash
# [VPS], dentro de /home/deploy/evento-curitiba
npm install
npm run build
```

Confirme `✓ Compiled successfully` e sem erro de TypeScript antes de seguir.

```bash
# [VPS]
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 show evento-curitiba   # confirma status "online"
```

`pm2 save` grava a lista de processos para sobreviver a um reboot da VPS — os outros
projetos (site, sistema, patinhas etc.) já dependem disso, então rodar de novo aqui só
atualiza a lista, não afeta os demais.

## 5. DNS

No painel do domínio (registro.br), criar o subdomínio apontando para a VPS:

```
Tipo   Nome        Valor
A      inscricao   72.61.48.71
```

TTL padrão. Esperar propagar (minutos, geralmente) antes do passo 7.

## 6. nginx

```bash
# [VPS]
sudo cp deploy/nginx.conf /etc/nginx/sites-available/evento-curitiba
sudo cp deploy/evento-curitiba-headers.conf /etc/nginx/sites-available/evento-curitiba-headers.conf
sudo ln -s /etc/nginx/sites-available/evento-curitiba /etc/nginx/sites-enabled/evento-curitiba
sudo nginx -t
```

**Só depois do `nginx -t` passar limpo:**

```bash
sudo systemctl reload nginx
```

Nunca `restart` com config não testada — é VPS compartilhada, um nginx quebrado derruba os
outros sites (site principal, sistema, patinhas, mariahseguros, etc).

## 7. Certificado HTTPS

Com o DNS já propagado e o nginx já servindo HTTP na porta 80 para o novo host:

```bash
# [VPS]
sudo certbot certonly --nginx --cert-name evento-curitiba -d inscricao.priorizecorporativa.com.br
sudo nginx -t && sudo systemctl reload nginx
```

## 8. Verificação final

```bash
# [VPS]
curl -sI http://127.0.0.1:3002 | head -5

# [LOCAL] ou [VPS]
curl -sI https://inscricao.priorizecorporativa.com.br | head -8
```

Espera `HTTP/1.1 200 OK` nos dois. Depois, abrir no navegador e:

1. Preencher o formulário de verdade e confirmar que o e-mail chega em
   `contato@priorizecorporativa.com.br` (primeiro envio real — mesmo passo que o site
   principal precisou na hora de ir ao ar).
2. Testar em um celular de verdade, não só redimensionando o Chrome.

## Depois disso

Atualizar a demanda 9 em `Planejamento/19-Documentacao-de-Requisitos.md`: marcar CA02 e
CA04 como feitos, e tirar "publicar em produção" do item 9.3.

## Atualizações de rotina, depois do primeiro deploy

Mesma receita do site (`Site/deploy/README.md`), trocando o caminho e o nome do processo:

```bash
# [LOCAL]
git add <arquivos>
git commit -m "..."
git push origin main
```

```bash
# [VPS]
cd /home/deploy/evento-curitiba
git pull origin main   # já usa a chave certa, fixada no passo 2
npm run build          # só depois de confirmar "Compiled successfully"
pm2 restart evento-curitiba
```
