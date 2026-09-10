# Comando para criação de usuário administrador

Execute no container da aplicação:

```bash
docker exec -it agendamento-inss-app npx tsx server/scripts/create-user.ts "<CPF_FORMATADO>" "<NOME_COMPLETO>" "<EMAIL>" "<SENHA>" "admin"
```