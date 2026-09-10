# Sistema de Agendamento OAB/SC - Convênio INSS

<p align="center">

![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

</p>

## Visão Geral

O **Sistema de Agendamento OAB/SC - Convênio INSS** é uma plataforma desenvolvida para gerenciar o agendamento de atendimentos e cadastros de advogados no âmbito do acordo de cooperação técnica entre a Ordem dos Advogados do Brasil - Seccional Santa Catarina e o Instituto Nacional do Seguro Social (INSS).

A plataforma conta com autenticação integrada ao webservice BRC (API) institucional da OAB/SC, contingência local para indisponibilidade, formulários digitais de TCMS com upload de anexos, controle de limites mensais de agendamento e módulo de gestão administrativa.

### Funcionalidades

* **Autenticação Institucional:**
  * Validação de credenciais diretamente no webservice BRC (API) usando o BRC.
  * Validação de inscrição ativa e número de registro no Conselho.
  * Mecanismo de fallback local para tolerância a falhas na indisponibilidade do webservice externo.
  * Restrição de acesso a advogados regularmente inscritos e administradores pré-autorizados.

* **Portal do Advogado:**
  * Solicitação e gerenciamento de agendamentos presenciais ou virtuais de INSS.
  * Preenchimento e envio do formulário de adesão TCMS (Termo de Compromisso de Manutenção de Sigilo).
  * Upload e armazenamento seguro de documentos assinados.
  * Acompanhamento do status de homologação de cadastros.

* **Painel Administrativo:**
  * Visualização consolidada de agendamentos diários e calendário geral.
  * Análise, aprovação e reprovação de formulários TCMS com registro de justificativas.
  * Gerenciamento de bloqueios de horários e períodos indisponíveis.
  * Configuração de limites operacionais de agendamento por usuário e prazos de antecedência.
  * Edição de modelos de e-mail e templates de notificação.
  * Auditoria detalhada de acessos e operações sensíveis.

---

## Pré-requisitos

Para executar a aplicação em ambiente operacional ou de homologação, certifique-se de possuir:

* Docker (versão 20.10 ou superior) instalado.
* Docker Compose (v2 ou superior) instalado.
* Conectividade com a base de dados MySQL (servidor dedicado ou container).
* Conectividade de rede com o webservice BRC (API) da OAB/SC (`https://servicos.oab-sc.org.br/WSAutenticar/WSAutenticar.asmx`).
* Porta `3940` (ou porta configurada) liberada no host.

---

## Início Rápido (Docker - Método Oficial)

O método padrão e homologado de execução da aplicação é via containers Docker.

### 1. Obter os arquivos do projeto

Posicione-se no diretório raiz da aplicação:

```bash
cd /caminho/para/o/projeto
```

### 2. Configurar o arquivo `.env`

Crie o arquivo `.env` com base no modelo fornecido:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure os parâmetros de conexão ao banco e chaves de sessão conforme detalhado na seção [Configuração de Ambiente](#configuração-de-ambiente).

### 3. Construir e iniciar os containers

Execute o comando para provisionar e subir o container da aplicação:

```bash
docker compose up --build -d
```

Para verificar se o container está em execução:

```bash
docker ps --filter "name=agendamento-inss-app"
```

Para visualizar os logs de inicialização e monitoramento:

```bash
docker logs -f agendamento-inss-app
```

### 4. Acessar a aplicação

Após a subida do container, acesse pelo navegador:

```text
http://localhost:3940
```

---

## Gestão de Usuários Administradores

A atribuição de privilégios de Administrador no sistema é estritamente manual, garantindo que usuários comuns e acessos não autorizados não obtenham acesso ao painel de gestão.

### 1. Criar novo Administrador Local (via Container Docker)

Para criar um novo usuário administrador local diretamente no banco de dados da aplicação:

```bash
docker exec -it agendamento-inss-app npx tsx server/scripts/create-user.ts "<CPF>" "<NOME_COMPLETO>" "<EMAIL>" "<SENHA>" "admin"
```

**Exemplo prático:**

```bash
docker exec -it agendamento-inss-app npx tsx server/scripts/create-user.ts "000.000.000-00" "Nome Administrador" "admin@oab-sc.org.br" "senhaSegura123" "admin"
```

O script realiza a validação do formato de dados, gera o hash criptográfico seguro (bcrypt) da senha e registra o usuário com a role `admin` e método `local_admin`.

### 2. Promover Advogado já cadastrado a Administrador (via SQL)

Caso o usuário já seja um advogado inscrito na OAB/SC que acessa o sistema com a senha institucional da OAB, basta promover o registro existente na tabela `users`:

```sql
UPDATE users SET role = 'admin' WHERE cpf = '<CPF_DO_USUARIO>';
```

O advogado continuará utilizando suas credenciais institucionais OAB/SC para autenticação, passando a ter acesso ao menu de Gestão Administrativa.

---

## Configuração de Ambiente

Todas as definições operacionais são gerenciadas por variáveis de ambiente via arquivo `.env`.

### Variáveis Disponíveis

| Variável | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | Ambiente de execução (`production` ou `development`) | `production` |
| `TZ` | String | Fuso horário do sistema operacional | `America/Sao_Paulo` |
| `DATABASE_URL` | String | String de conexão MySQL (URI completa) | `mysql://user:pass@host:3306/agendamento_inss` |
| `SESSION_SECRET` | String | Chave de assinatura para sessões HTTP | `string_aleatoria_longa` |
| `JWT_SECRET` | String | Chave de assinatura de tokens JWT | `string_aleatoria_longa` |
| `COOKIE_SECRET` | String | Chave de assinatura para cookies seguros | `string_aleatoria_longa` |
| `APP_ID` | String | Identificador da aplicação no ecossistema | `agendamento-inss` |
| `BRC (API)_AUTH_URL` | String | URL do endpoint BRC (API) de autenticação | `https://servicos.oab-sc.org.br/WSAutenticar/WSAutenticar.asmx` |

### Exemplo de `.env`

```env
NODE_ENV=production
TZ=America/Sao_Paulo

DATABASE_URL=mysql://gabrieljsdb:%40Aa016512@172.16.2.5:3306/agendamento_inss

SESSION_SECRET=#lmjmMJ2484#$22
JWT_SECRET=#lmjmMJ2484#$22
COOKIE_SECRET=#lmjmMJ2484#$22

APP_ID=agendamento-inss
BRC (API)_AUTH_URL=https://servicos.oab-sc.org.br/WSAutenticar/WSAutenticar.asmx
```

*Nota: As configurações de SMTP para disparo de e-mails são gerenciadas diretamente no painel administrativo em `/admin/settings` e persistidas na tabela `system_settings`.*

---

## Arquitetura de Autenticação e Segurança

```text
                  ┌───────────────────────────────┐
                  │    Tela de Login (/login)     │
                  │         (CPF + Senha)         │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ localAuthService (Fallback)   │
                  └───────────────┬───────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
      ┌──────────────────────┐          ┌──────────────────────┐
      │ Webservice BRC (API) OAB  │          │  Autenticação Local  │
      │   (Validação Ativa)  │          │ (Fallback / Admins)  │
      └──────────┬───────────┘          └──────────┬───────────┘
                 │                                 │
        Sucesso? │                                 │
     ┌───────────┴───────────┐                     │
     │                       │                     │
 Sim ▼                    Não▼                     │
┌──────────────────┐    ┌─────────────────────┐    │
│ Possui OAB /     │    │ Se Admin Local      │◄───┘
│ Admin no Banco?  │    │ tenta Local, senão  │
└────────┬─────────┘    │ bloqueia com erro   │
         │              └─────────────────────┘
     Sim │
         ▼
┌──────────────────┐
│ Sessão Criada    │
│ role: user/admin │
└──────────────────┘
```

### Regras Estritas de Acesso

1. **Bloqueio de Não-Advogados:** Usuários que autenticarem no serviço do Conselho mas não possuírem número de inscrição OAB ativo são bloqueados imediatamente com código `FORBIDDEN` e instruídos a contatar o WhatsApp `(48) 3239-3500`.
2. **Atribuição de Privilégios:** Apenas registros pré-existentes na base de dados com `role = 'admin'` recebem contexto administrativo. Novos registros criados no login recebem estritamente `role = 'user'`.
3. **Prevenção de Colisão:** Usuários sem OAB possuem identificadores exclusivos para evitar conflitos de chave única no banco de dados.

---

## Estrutura de Diretórios

```text
.
├── client/                     # Código-fonte do frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis (shadcn/ui)
│   │   ├── hooks/              # Custom hooks React
│   │   ├── lib/                # Configurações de clientes (tRPC, utils)
│   │   └── pages/              # Telas da aplicação (Login, Dashboard, Admin)
│   └── index.html              # Entrypoint HTML do client
├── server/                     # Backend Node.js / Express
│   ├── _core/                  # Infraestrutura base (context, SDK, cookies)
│   ├── scripts/                # Utilitários CLI (criação de admin)
│   ├── services/               # Serviços de negócio (BRC (API), LocalAuth, E-mail)
│   ├── db.ts                   # Camada de acesso e queries ao banco
│   └── routers.ts              # Definição de routers e procedures tRPC
├── drizzle/                    # Esquema do banco de dados Drizzle ORM
│   └── schema.ts               # Definição de tabelas, tipos e relacionamentos
├── shared/                     # Tipos e constantes compartilhados
├── docker-compose.yml          # Manifesto de orquestração Docker
├── Dockerfile                  # Imagem de build da aplicação
└── package.json                # Dependências e scripts do projeto
```

---

## Manutenção e Comandos Úteis

### Parar os containers

```bash
docker compose down
```

### Reiniciar os containers aplicando alterações

```bash
docker compose down && docker compose up -d
```

### Reconstruir a imagem após alterações em dependências

```bash
docker compose up --build -d
```

### Acessar o terminal interativo do container

```bash
docker exec -it agendamento-inss-app sh
```

---

## Licença

Uso restrito e exclusivo da Ordem dos Advogados do Brasil - Seccional de Santa Catarina (OAB/SC). Todos os direitos reservados.
