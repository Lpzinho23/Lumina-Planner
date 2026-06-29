# dash-financeiro

**FinApp** é um dashboard financeiro pessoal em **Next.js** (App Router) e **Firebase** (Auth, Firestore, Storage), com interface em **pt-BR**. O código da aplicação fica na pasta [`fin-app/`](fin-app/).

![FinApp — dashboard](docs/assets/dashboard.png)

A imagem acima é um placeholder em `docs/assets/dashboard.png` (pode substituir por uma captura real ~1280×720).

## Pré-requisitos

- **Node.js** LTS (recomendado **20.x**, alinhado a `engines` em `fin-app/package.json`)
- **npm**

## Quick start

```bash
cd fin-app
npm install
npm run dev
```

Documentação detalhada (estrutura, variáveis de ambiente, Firestore, rotas): **[`fin-app/README.md`](fin-app/README.md)**.

## Segurança

Dados financeiros no cliente dependem de **Firestore Rules** (e regras de Storage) corretas. Veja a seção correspondente no README do `fin-app`.

## Deploy (ex.: Vercel)

Configure as variáveis `NEXT_PUBLIC_FIREBASE_*` conforme [`fin-app/.env.example`](fin-app/.env.example). Em produção o app **não** inicializa o Firebase sem essas variáveis (comportamento descrito em `fin-app/README.md`).

## CI

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda `npm ci`, `npm run lint`, `npm run build` e `npm test` na pasta `fin-app` com variáveis Firebase dummy para o build passar.

## Licença / uso

Projeto **private** no `package.json` do `fin-app`; uso pessoal — defina licença se for publicar.
