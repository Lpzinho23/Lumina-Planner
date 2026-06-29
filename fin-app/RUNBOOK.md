# Runbook Operacional

Guia rapido para operacao do projeto em producao.

## 1) Checklist pre-deploy

Na branch de release:

1. `npm ci`
2. `npm run security:check`
3. Confirmar que nao existem falhas `high/critical` no audit.
4. Revisar alteracoes em:
   - `firestore.rules`
   - `storage.rules`
   - `next.config.ts` (headers/CSP)

Se algo falhar, interromper deploy.

## 2) Deploy de aplicacao

Fluxo recomendado:

1. Build local: `npm run build`
2. Deploy na plataforma de hospedagem.
3. Smoke test:
   - login
   - dashboard
   - cadastro/edicao de lancamento
   - upload de avatar

## 3) Deploy de regras Firebase

Se usar CLI:

- `firebase deploy --only firestore:rules,storage --project <project_id>`

Se usar Console:

- Publicar regras em Firestore/Storage manualmente e executar checklist de validacao.

## 4) Rollback rapido

### App

1. Reverter para ultimo deploy estavel na plataforma de hosting.
2. Rodar smoke test minimo (login/dashboard/salvar lancamento).

### Regras Firebase

1. Reaplicar a ultima versao estavel de `firestore.rules` e `storage.rules`.
2. Publicar novamente.
3. Testar:
   - usuario A nao acessa dados de B
   - upload invalido bloqueado

## 5) Resposta a incidente

1. Classificar severidade (baixo/medio/alto/critico).
2. Mitigar imediatamente:
   - desabilitar funcionalidade afetada (se possivel),
   - endurecer regra Firebase,
   - rollback de deploy.
3. Coletar evidencias:
   - periodo afetado
   - escopo de usuarios
   - tipo de dado impactado
4. Corrigir causa raiz e abrir hotfix.
5. Pos-incidente:
   - documentar causa raiz,
   - adicionar teste/regra para evitar recorrencia.

## 6) Comandos uteis

- Testes: `npm run test`
- Lint: `npm run lint`
- Auditoria alta/critica em prod deps: `npm run audit:prod-high`
- Checagem completa de seguranca: `npm run security:check`

## 7) Dono de decisao em emergencia

Quando houver impacto de seguranca, priorizar:

1. Bloquear vazamento/acesso indevido.
2. Restaurar servico minimo com seguranca.
3. Recuperar UX completa depois.
