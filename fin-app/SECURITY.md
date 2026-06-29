# Security Playbook

Este documento define a rotina operacional de seguranca do projeto.

## Escopo

- App Next.js (frontend e runtime server)
- Firebase Authentication
- Firestore e Storage (regras)
- Dependencias npm

## Rotina de verificacao

Executar antes de release:

1. `npm run test`
2. `npm run lint`
3. `npm run audit:prod-high`

Se qualquer etapa falhar, bloquear release ate correcao.

## Politica de dependencia

- Atualizacoes automatizadas via Dependabot (semanal).
- Vulnerabilidades `high` e `critical` devem ser corrigidas com prioridade.
- Vulnerabilidades `moderate` devem ser avaliadas e planejadas.

## Politica de dados e acesso

- Firestore: acesso somente em `users/{uid}/...` com `request.auth.uid == uid`.
- Storage: upload de avatar somente em `avatars/{uid}` com validacao de tipo/tamanho.
- Qualquer rota fora desse escopo deve permanecer bloqueada por default.

## Logs e dados sensiveis

- Nao registrar senha, token, credenciais ou payload bruto sensivel em logs.
- Preferir mensagens de erro amigaveis no UI e logs tecnicos resumidos.

## Resposta a incidente

1. Identificar escopo (dados, usuarios, periodo).
2. Mitigar imediatamente (regras, feature flag, rollback, hotfix).
3. Validar correcoes com testes e auditoria.
4. Registrar causa raiz e acao preventiva.

## Checklist de release segura

- [ ] Regras do Firebase revisadas e publicadas.
- [ ] `npm run audit:prod-high` sem `high/critical`.
- [ ] Testes e lint verdes.
- [ ] Headers de seguranca ativos em producao.
- [ ] Runbook operacional revisado (`RUNBOOK.md`).
