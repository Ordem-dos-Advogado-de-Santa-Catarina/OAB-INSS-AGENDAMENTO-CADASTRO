# Tarefas - Implementação Completa de Segurança e Autenticação

## Fase 1: Bloqueio de Não-Advogados e Validação OAB
- [x] 1.1 Verificar no `loginWithSOAP` (`server/routers.ts`) se o CPF já é admin pré-existente no banco
- [x] 1.2 Bloquear não-advogados sem inscrição OAB ativa no SOAP com TRPCError FORBIDDEN
- [x] 1.3 Configurar mensagem de bloqueio com contato do WhatsApp (48) 3239-3500

## Fase 2: Blindagem de Atribuição de Role
- [x] 2.1 Garantir que novos usuários recebam exclusivamente `role: 'user'`
- [x] 2.2 Remover promoção automática via `ENV.ownerOpenId` em `server/db.ts`

## Fase 3: Prevenção de Colisão no Banco de Dados
- [x] 3.1 Impedir inserção/atualização de `oab` como string vazia `""` duplicada no `upsertUser`
- [x] 3.2 Garantir unicidade sem sobrescrever registros de terceiros

## Fase 4: Ajuste de Fallback Local
- [x] 4.1 Não acionar fallback local para senhas rejeitadas ativamente pelo webservice SOAP
- [x] 4.2 Manter fallback ativo apenas em indisponibilidade do webservice e para admins locais (`local_admin`)

## Fase 5: Desativação de Rotas OAuth Não Utilizadas
- [x] 5.1 Desativar registro de `/api/oauth/callback` em `server/_core/index.ts`

## Fase 6: Otimização e Verificação
- [x] 6.1 Ajustar `authenticateRequest` para evitar upsert completo desnecessário a cada request
- [x] 6.2 Executar testes estáticos e validação de fluxo
