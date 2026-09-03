// Config do PM2 para produção na VPS emprestada. Mesmo padrão de
// Site/deploy/ecosystem.config.js, rodando sob o usuário `deploy`.
//
// Porta 3002: 3000 já é o "patinhas", 3001 já é o "priorize-site".
// CONFIRME antes de subir: `ss -tln | grep 3002` na VPS. Se estiver ocupada,
// troque aqui e no nginx.conf deste mesmo diretório.
module.exports = {
  apps: [
    {
      name: "evento-curitiba",
      cwd: "/home/deploy/evento-curitiba",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3002",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
