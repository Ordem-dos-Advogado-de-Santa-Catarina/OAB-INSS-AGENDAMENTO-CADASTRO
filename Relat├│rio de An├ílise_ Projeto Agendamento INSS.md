# Relatório de Análise: Projeto Agendamento INSS

**Autor:** Manus AI  
**Data:** 23 de Abril de 2026

Este relatório apresenta uma análise detalhada do projeto "Agendamento INSS Permanente", fornecido em formato ZIP. A análise cobre a estrutura do projeto, stack tecnológico, arquitetura, principais funcionalidades e observações sobre a qualidade e segurança do código.

## 1. Visão Geral do Projeto

O projeto **agendamento-inss-permanente** é uma aplicação web completa projetada para gerenciar agendamentos de atendimentos, especificamente voltada para advogados interagindo com o INSS, com integração aos sistemas da OAB/SC.

O sistema permite que os usuários se autentiquem, preencham formulários, anexem documentos e agendem horários de atendimento. A aplicação respeita regras de negócio complexas, como limites mensais, bloqueios de agenda, antecedência para cancelamentos e horários de funcionamento estabelecidos pela administração.

## 2. Stack Tecnológico

A aplicação utiliza uma arquitetura moderna baseada em TypeScript tanto no frontend quanto no backend, operando em um monorepo estruturado. A escolha das tecnologias demonstra foco em produtividade, segurança de tipos e performance.

| Camada | Tecnologia Principal | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React 19 com Vite | Interface de usuário moderna com roteamento via Wouter e estilização com Tailwind CSS v4 e Radix UI. |
| **Gerenciamento de Estado** | TanStack React Query | Integrado com tRPC para gerenciamento de dados e comunicação type-safe com o backend. |
| **Backend** | Node.js com Express | Servidor da API construído com TypeScript, utilizando tRPC para definição de rotas e procedimentos. |
| **Banco de Dados** | MySQL / MariaDB | Persistência de dados gerenciada através do Drizzle ORM, garantindo tipagem estrita nas consultas. |
| **Autenticação** | Híbrida (SOAP / JWT) | Integração primária via serviço SOAP da OAB/SC, com fallback para autenticação local usando JWT e bcryptjs. |
| **Infraestrutura** | Docker e pnpm | Containerização para ambientes consistentes e gerenciamento eficiente de dependências em monorepo. |

## 3. Arquitetura e Estrutura de Diretórios

O projeto segue uma estrutura lógica de monorepo, separando claramente as responsabilidades entre cliente e servidor, enquanto compartilha tipos essenciais. O diretório do cliente contém todo o código React, organizado em componentes reutilizáveis, páginas da aplicação e utilitários de estado. O diretório do servidor abriga a API Node.js, com configurações centrais, serviços isolados para regras de negócio e a definição de rotas tRPC.

A arquitetura do servidor é notável por centralizar múltiplas responsabilidades no mesmo processo Node.js. O arquivo principal inicializa não apenas a API HTTP (Express e tRPC) e o servidor de arquivos estáticos, mas também instancia um agendador de tarefas (Cron) e um processador de filas de e-mail (Worker). Essa abordagem monolítica simplifica o deploy inicial, agrupando todas as funcionalidades necessárias em um único contêiner.

## 4. Principais Funcionalidades e Regras de Negócio

### Autenticação Híbrida e Gestão de Usuários
O sistema possui um mecanismo de autenticação robusto que prioriza a integração com a OAB/SC. Ao tentar o login, o serviço SOAP é consultado primeiro; em caso de sucesso, os dados do advogado, incluindo seu status de inadimplência, são importados e sincronizados no banco de dados local. O sistema também suporta autenticação puramente local, essencial para administradores do sistema ou como contingência em caso de indisponibilidade do serviço externo.

### Gestão Avançada de Agendamentos
A lógica de agendamento é o núcleo da aplicação, implementando regras estritas para garantir a organização dos atendimentos. O sistema restringe os agendamentos ao horário de expediente configurado e respeita bloqueios manuais criados pelos administradores, bem como finais de semana. Uma regra específica impede agendamentos para o dia seguinte após as 19h do dia atual. 

Além disso, os usuários estão sujeitos a um limite mensal de agendamentos. Ao atingir esse limite, o sistema impõe uma quarentena de 30 dias a partir do último atendimento antes de permitir uma nova marcação. Cancelamentos também são regulados, exigindo uma antecedência mínima de 12 horas e aplicando um bloqueio temporário de 2 horas antes que o usuário possa realizar um novo agendamento.

### Painel Administrativo e Processamento em Background
O sistema conta com uma área administrativa completa que permite a visualização de agendamentos diários, o gerenciamento de bloqueios de agenda e a configuração de parâmetros vitais, como horários, limites e credenciais SMTP. Os administradores também podem personalizar templates de e-mail e auditar ações críticas do sistema.

Para manter a responsividade da API, o envio de e-mails é gerenciado através de uma fila no banco de dados, processada assincronamente a cada 30 segundos por um worker interno. Paralelamente, tarefas agendadas rodam a cada minuto para atualizar automaticamente o status de agendamentos passados para "Não Compareceu" e para enviar relatórios diários consolidados aos administradores no horário pré-determinado.

## 5. Análise de Qualidade e Segurança

O uso extensivo de TypeScript, aliado ao tRPC, Drizzle ORM e Zod, garante consistência de tipos desde o banco de dados até a interface do usuário. Essa abordagem "Type Safety End-to-End" reduz drasticamente a ocorrência de bugs em tempo de execução. O código do backend apresenta uma excelente separação de responsabilidades, isolando as rotas da lógica de negócios e do acesso a dados. A concorrência é bem tratada no nível do banco de dados, com índices únicos que previnem a sobreposição de agendamentos no mesmo horário. O sistema também mantém um registro rigoroso de auditoria para ações críticas, o que é fundamental para aplicações institucionais.

Apesar da arquitetura sólida, existem oportunidades de melhoria focadas em escalabilidade. Rodar o servidor web, o worker de e-mail e o cron no mesmo processo Node.js funciona perfeitamente para baixa escala. Contudo, em um cenário de escalabilidade horizontal com múltiplas instâncias, os processos em background rodariam em duplicidade, podendo causar o envio de e-mails repetidos. A separação desses workers em serviços independentes mitigaria esse risco. Além disso, os uploads de arquivos são salvos no sistema de arquivos local do contêiner. A adoção de um serviço de armazenamento de objetos em nuvem (como AWS S3, cujas bibliotecas já constam no projeto) ofereceria maior segurança e facilitaria a escalabilidade da infraestrutura.

## 6. Conclusão

O projeto "Agendamento INSS Permanente" é uma aplicação bem estruturada, moderna e com regras de negócio solidamente implementadas. A escolha da stack tecnológica demonstra alinhamento com as melhores práticas atuais de desenvolvimento web, priorizando a segurança, a tipagem estrita e a produtividade. A aplicação está pronta para operação em ambientes de pequeno a médio porte, entregando uma solução completa para a gestão de agendamentos institucionais.
