# FinApp — Dashboard financeiro pessoal

Aplicação **Next.js (App Router)** para controle de receitas, despesas, cartões, contas, investimentos/cofrinho e visualização em gráficos. Dados em **Firebase** (Auth, Firestore, Storage). Idioma da UI: **pt-BR**.

Este README resume o projeto para **outro agente ou desenvolvedor** entrar no contexto rápido.

**Node recomendado:** **20.x** (LTS), alinhado a `engines` em [`package.json`](package.json) e ao arquivo [`.nvmrc`](.nvmrc).

---

## Onde está o código

| Caminho | Função |
|---------|--------|
| [`app/`](app/) | Rotas Next.js |
| [`app/(protected)/`](app/(protected)/) | Rotas que exigem login (`RequireAuth` no layout) |
| [`app/login`](app/login), [`app/cadastro`](app/cadastro) | Auth sem sidebar |
| [`components/`](components/) | UI compartilhada (`Sidebar`, `RequireAuth`, `DashboardGrid`, `components/control/`, `components/dashboard/`) |
| [`context/`](context/) | `AuthContext` (user, loading, login, signup, logout), `ThemeContext` (claro/escuro + MUI theme) |
| [`lib/firebase.ts`](lib/firebase.ts) | Inicialização Firebase (`auth`, `db`, `storage`) |
| [`lib/constants.ts`](lib/constants.ts), [`lib/format.ts`](lib/format.ts), [`lib/finance.ts`](lib/finance.ts) | Constantes compartilhadas, formatação BRL/data, helpers de tipo |
| [`lib/hooks/`](lib/hooks/) | Hooks `useTransactions`, `useCards`, `useAccounts` (listeners Firestore) |
| [`types/finance.ts`](types/finance.ts) | Tipos Firestore/UI (`TransactionRecord`, `CardRecord`, etc.) |
| [`firestore.rules`](firestore.rules) | Regras **sugeridas** (deploy manual no Firebase) |
| [`.env.example`](.env.example) | Variáveis `NEXT_PUBLIC_FIREBASE_*` |

---

## Stack

- **Next.js 16**, **React 19**, **TypeScript** (`strict`)
- **MUI 7** + Emotion; **Grid legado**: `import Grid from '@mui/material/GridLegacy'` (API `item`/`container`)
- **Firebase** 12 (Auth, Firestore, Storage)
- **Recharts** (gráficos), **react-grid-layout** (dashboard arrastável, carregamento client-only)
- **react-hot-toast** (feedback)
- **Vitest** (testes de funções puras em `lib/*.test.ts`)

---

## Comandos

Na pasta **`fin-app`**:

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm test
npm run test:watch
```

---

## Variáveis de ambiente

1. Copie [`.env.example`](.env.example) para `.env.local`.
2. Preencha as chaves do console Firebase (SDK web).

O app **não** usa mais chaves reais hardcoded em [`lib/firebase.ts`](lib/firebase.ts):

- Em **desenvolvimento**, se faltar alguma `NEXT_PUBLIC_FIREBASE_*`, aparece `console.warn` listando o que falta (copie `.env.example` → `.env.local`).
- Em **produção** (`NODE_ENV=production`), se faltar alguma variável, o boot **falha** com erro explícito (evita build/deploy sem configuração).
- O **CI** (workflow na raiz do repositório) exporta valores dummy só para `next build` passar.

---

## Firestore — modelo de dados

Tudo sob `users/{uid}/`:

| Coleção / doc | Conteúdo |
|---------------|-----------|
| `transactions` | Lançamentos (`income`, `expense_fixed`, `expense_variable`, `savings`, `piggy`), valores, datas, banco, método de pagamento, status, etc. |
| `cards` | Cartões (nome, limite, cor) |
| `accounts` | Contas (nome, saldo inicial, cor) |
| `settings/dashboard` | Layout JSON do grid do dashboard |

Regras de exemplo: [`firestore.rules`](firestore.rules) (acesso apenas ao próprio `uid`). **Publicar no Firebase** não é automático pelo repo.

Registros com `type` inválido no Firestore são **ignorados** no cliente (com `console.warn`), via [`lib/finance.ts`](lib/finance.ts) (`parseFirestoreTransaction`).

---

## Autenticação e rotas

- **Auth**: [`context/AuthContext.tsx`](context/AuthContext.tsx) — `onAuthStateChanged`, expõe `user`, `loading`, `login`, `signup`, `logout`.
- **Home** [`app/page.tsx`](app/page.tsx): redireciona para `/dashboard` ou `/login` quando `!loading`.
- **Protegido**: [`app/(protected)/layout.tsx`](app/(protected)/layout.tsx) envolve [`components/RequireAuth.tsx`](components/RequireAuth.tsx) — skeleton enquanto `loading`; se não houver usuário, redireciona para `/login?next=...`.
- **Layout raiz** [`app/layout.tsx`](app/layout.tsx): `ThemeContextProvider` → `AuthProvider` → sidebar (exceto login/cadastro) + `Toaster`.

---

## Rotas públicas vs protegidas

| Rota | Protegida |
|------|-----------|
| `/` | Não (redirect) |
| `/login`, `/cadastro` | Não |
| `/dashboard`, `/control`, `/settings` | Sim (`(protected)`) |

---

## Pontos de atenção para o agente

1. **Firebase no cliente**: segurança depende de **Firestore Rules** e Storage rules; não há API Routes para dados financeiros.
2. **Dashboard grid**: [`components/DashboardGrid.tsx`](components/DashboardGrid.tsx) importa `react-grid-layout` no client; a página usa `dynamic(..., { ssr: false })`.
3. **Recharts v3**: alguns props do `<Pie>` (ex.: `activeIndex`) não batem com os tipos; o projeto usa um componente `PieInteractive` com cast controlado onde necessário.
4. **Tipos**: preferir [`types/finance.ts`](types/finance.ts) em vez de `any` em novos fluxos.

---

## Estrutura mínima de pastas `app/`

```
app/
  layout.tsx, page.tsx, globals.css
  login/, cadastro/
  (protected)/
    layout.tsx          ← RequireAuth
    dashboard/page.tsx
    control/page.tsx    ← CRUD + faturas, parcelas, cofrinho
    settings/page.tsx   ← perfil, senha, exportação, reset e exclusão de conta
```

---

## Licença / privado

Projeto marcado como `private` no `package.json`; ajuste licença conforme o dono do repositório.
