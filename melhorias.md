# Plano de melhorias — execução passo a passo (para outro agente)

Este documento descreve melhorias para o repositório **dash-financeiro / FinApp** (`fin-app` em Next.js + Firebase). Cada fase tem **Objetivo**, **Tarefas** e um **Prompt pronto** para colar em uma nova conversa do Cursor (ou outro agente).

**Contexto fixo para qualquer agente:**

- Raiz do repositório: `dash-financeiro`.
- Código da aplicação: pasta `fin-app/` (Next.js App Router + TypeScript strict + MUI 7 + Firebase 12 + Recharts).
- Documentação detalhada já existe em `fin-app/README.md`.
- Regras obrigatórias do projeto (todas as fases):
  - Proibido `any`. Em dúvida, usar `unknown` + type guard.
  - `try/catch` **nunca** vazio: usar `console.error` e/ou `toast` com mensagem amigável em pt-BR.
  - Toda ação assíncrona com feedback visual de loading e `disabled` durante o processamento; toast de sucesso/erro.
  - `aria-label` em todo elemento interativo só com ícone; `alt` descritivo em imagens; hierarquia de headings correta.
  - `useMemo`/`useCallback` apenas onde houver cálculo pesado real ou problema de re-render comprovado; não criar funções anônimas instáveis em props de filhos memoizados.

---

## Como usar

1. Execute as fases preferencialmente na ordem; pule o que não fizer sentido para você.
2. Copie o bloco **Prompt para o agente** inteiro e cole em uma nova conversa.
3. Ao terminar uma fase, marque o checkbox manualmente ou peça ao próprio agente para atualizar este arquivo.

---

## Fase 1 — Limpezas rápidas e baratas

**Objetivo:** Eliminar pequenas inconsistências antes de qualquer refactor.

**Tarefas:**

- [ ] Corrigir o script `"dev": "next dev "` em `fin-app/package.json` (remover espaço final).
- [ ] Conferir que `.env.local` está ignorado (`fin-app/.gitignore` já cobre `.env*`; só validar).
- [ ] Padronizar comentários: remover marcadores enumerativos repetidos (`// --- 1. IMPORTAÇÕES ---`, `// --- 2. ÍCONES ---`, etc.) das páginas grandes; manter apenas comentários que explicam intenção/trade-off.
- [ ] Garantir que não há `console.log` esquecido em `fin-app/app/**` e `fin-app/components/**` (manter apenas `console.error` em catches).

**Prompt para o agente:**

```
Você está no repositório dash-financeiro (Next.js + Firebase). Foque na pasta fin-app.

Tarefa: limpezas rápidas, sem refactor de comportamento.

1) Em fin-app/package.json, ajuste "dev": "next dev " para "next dev" (sem espaço final).
2) Confirme que .env.local NÃO é commitado e que fin-app/.gitignore já cobre .env*.
3) Em fin-app/app/(protected)/control/page.tsx, fin-app/app/(protected)/dashboard/page.tsx, fin-app/app/(protected)/settings/page.tsx, fin-app/app/(protected)/profile/page.tsx e fin-app/components/Sidebar.tsx, remova comentários puramente enumerativos no estilo "// --- 1. IMPORTAÇÕES VISUAIS ---" e similares. Mantenha comentários que expliquem decisão/trade-off.
4) Procure console.log em fin-app/app/** e fin-app/components/**; remova ou troque por console.error apenas dentro de catch.

Regras: pt-BR; sem any; não introduzir mudanças de comportamento; não tocar em node_modules nem em .next; rodar npm run lint no fin-app ao final e corrigir lints introduzidos por você.
```

---

## Fase 2 — Enriquecer o `README.md` da raiz

**Objetivo:** Quem clona o repositório entende o projeto, pré-requisitos e próximo passo sem abrir só `fin-app/`.

**Tarefas:**

- [ ] Adicionar descrição em 1–2 frases (FinApp, dashboard pessoal, Firebase, pt-BR).
- [ ] Listar pré-requisitos (Node.js LTS recomendado; npm).
- [ ] Deixar explícito que o código está em `fin-app/`.
- [ ] Manter link para `fin-app/README.md` e os comandos `cd fin-app` + install + dev.
- [ ] Uma linha de **segurança**: dados sensíveis dependem de Firestore Rules; ver doc em `fin-app`.
- [ ] Seção curta **Deploy** (ex.: Vercel) com "configure `NEXT_PUBLIC_FIREBASE_*` conforme `.env.example` em `fin-app`".
- [ ] Opcional: licença / "projeto privado" / contribuições.

**Prompt para o agente:**

```
Você está no repositório dash-financeiro (FinApp). Leia README.md na raiz e fin-app/README.md.

Tarefa: reescrever/enriquecer apenas o README.md da RAIZ do repositório (não substituir o fin-app/README.md).

Incluir:
1) Título e 1–2 frases sobre o que é o FinApp (Next.js, Firebase, pt-BR).
2) Pré-requisitos: Node.js (LTS) e npm.
3) Estrutura: indicar claramente que o código da aplicação está em fin-app/.
4) Quick start: cd fin-app, npm install, npm run dev (e link para fin-app/README.md para detalhes).
5) Uma linha de aviso de segurança: financeiro no cliente exige Firestore Rules corretas; detalhes no README do fin-app.
6) Seção breve "Deploy" (ex.: Vercel) mencionando variáveis NEXT_PUBLIC_FIREBASE_* e fin-app/.env.example.
7) Rodapé: projeto private no package.json; licença a critério do dono OU "uso pessoal".

Regras: pt-BR; não invente features que não existam no código; mudança só em README.md na raiz; tom técnico e conciso.
```

---

## Fase 3 — `engines` no `package.json` do `fin-app` + `.nvmrc`

**Objetivo:** Alinhar versão de Node entre máquinas e CI.

**Tarefas:**

- [ ] Adicionar `engines.node` em `fin-app/package.json` (ex.: `">=20.9.0"`, alinhado ao LTS atual e a Next 16).
- [ ] Criar `fin-app/.nvmrc` com a mesma major (`20`).
- [ ] Atualizar `fin-app/README.md` mencionando a versão recomendada (1 linha).

**Prompt para o agente:**

```
No fin-app/package.json, adicione o campo "engines" com Node compatível com Next 16 (use ">=20.9.0" salvo motivo melhor). Crie fin-app/.nvmrc com "20".

Atualize fin-app/README.md em uma linha mencionando a versão de Node recomendada (na seção Comandos ou em uma nova "Pré-requisitos").

Não altere mais nada além desses três arquivos. Regras do projeto seguem: pt-BR, sem any, lint deve continuar passando.
```

---

## Fase 4 — CI (GitHub Actions): lint + build

**Objetivo:** Cada PR valida `eslint` e `next build`.

**Tarefas:**

- [ ] Criar `.github/workflows/ci.yml` na raiz do repositório.
- [ ] Job: checkout → setup-node com `cache: npm` apontando para `fin-app/package-lock.json` → `cd fin-app` → `npm ci` → `npm run lint` → `npm run build`.
- [ ] Versão do Node = mesma de `engines` (Fase 3).
- [ ] Para `next build` passar sem segredos reais, usar `env` dummy (`NEXT_PUBLIC_FIREBASE_*=ci-placeholder`) só no workflow.
- [ ] Adicionar pequena seção "CI" no `README.md` da raiz (badge opcional).

**Prompt para o agente:**

```
Crie .github/workflows/ci.yml na raiz do repositório dash-financeiro.

Trigger: push e pull_request na branch default.

Steps (resumo):
- actions/checkout@v4
- actions/setup-node@v4 com node-version alinhada ao engines em fin-app/package.json e cache: 'npm', cache-dependency-path: fin-app/package-lock.json
- working-directory: fin-app
- npm ci
- npm run lint
- npm run build

Para o build passar sem chaves reais, exporte env NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID com valores dummy ("ci-placeholder") apenas no workflow.

Adicione no README da raiz uma seção curta "CI" com 1 linha explicando o workflow.

Regras: pt-BR no README; não modificar código de aplicação; o objetivo é apenas validar lint+build em CI.
```

---

## Fase 5 — Centralizar constantes e formatadores

**Objetivo:** Eliminar duplicação de listas (meses, bancos, categorias, cores, métodos) e de formatação BRL/data espalhada por dezenas de pontos.

**Tarefas:**

- [ ] Criar `fin-app/lib/constants.ts` com: `MONTHS_LIST`, `BANKS_FOR_EXPENSES`, `BANKS_FOR_INVESTMENTS`, `CATEGORIES_DEFAULT`, `CARD_COLORS`, `PAYMENT_METHODS`, `RECEIPT_METHODS`, `CDI_ANUAL_ATUAL`, `META_MENSAL_PIGGY`, `META_ANUAL_INVEST`, `SEMANTIC_COLORS`, `CHART_PALETTE`.
- [ ] Criar `fin-app/lib/format.ts` com:
  - `formatBRL(value: number): string` (Intl.NumberFormat `pt-BR`, BRL, 2 casas).
  - `formatDateBR(iso: string): string` (data ISO → `dd/MM/yyyy` em UTC).
  - `parseISODateUTC(iso: string): Date` (evita drift de fuso ao usar `getUTCMonth/Year`).
- [ ] Substituir todos os `toLocaleString('pt-BR', { minimumFractionDigits: 2 })` e `toFixed(2)` por `formatBRL` quando representam dinheiro.
- [ ] Substituir `new Date(t.date).toLocaleDateString('pt-BR')` por `formatDateBR(t.date)`.
- [ ] Substituir as listas duplicadas dentro de `control/page.tsx` e `dashboard/page.tsx` pelos imports de `lib/constants.ts`.

**Prompt para o agente:**

```
Em fin-app/, centralize constantes e formatadores hoje duplicados.

1) Crie fin-app/lib/constants.ts e mova para lá (com o mesmo conteúdo já existente nos arquivos):
   - MONTHS_LIST (de control/page.tsx e dashboard/page.tsx)
   - BANKS_FOR_EXPENSES, BANKS_FOR_INVESTMENTS, CATEGORIES_DEFAULT, CARD_COLORS, PAYMENT_METHODS, RECEIPT_METHODS (de control/page.tsx)
   - CDI_ANUAL_ATUAL (de control/page.tsx)
   - SEMANTIC_COLORS, CHART_PALETTE (de dashboard/page.tsx)
   - Adicione META_MENSAL_PIGGY = 300 e META_ANUAL_INVEST = 40000 (extraídos de PiggyBlock e DashboardPage).
   Use `as const` onde fizer sentido.

2) Crie fin-app/lib/format.ts com:
   export const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
   export const formatBRL = (value: number): string => brlFormatter.format(value);
   export const parseISODateUTC = (iso: string): Date => new Date(`${iso}T00:00:00Z`);
   export const formatDateBR = (iso: string): string => parseISODateUTC(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

3) Refatore os usos espalhados:
   - Trocar `toFixed(2)` em valores monetários por formatBRL.
   - Trocar `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` por `formatBRL(val)`.
   - Trocar `new Date(t.date).toLocaleDateString('pt-BR')` por formatDateBR(t.date).
   - Trocar `new Date(t.date).getUTCMonth()/getUTCFullYear()` por usar parseISODateUTC quando o input for string ISO YYYY-MM-DD.

Regras: sem any; lint passa; não alterar a aparência (formatBRL deve produzir "R$ 1.234,56"); manter mesmas casas decimais; não tocar em strings que não sejam dinheiro.

Ao final rode: cd fin-app && npm run lint && npm run build.
```

---

## Fase 6 — Tipos estritos em `TransactionRecord`

**Objetivo:** Eliminar `string` solto onde já existe `TransactionType`, e remover `t.type.includes('expense')` espalhado.

**Tarefas:**

- [ ] Em `fin-app/types/finance.ts`, trocar `type: string` por `type: TransactionType` em `TransactionRecord`.
- [ ] Adicionar helpers em `fin-app/lib/finance.ts`:
  - `isExpenseType(t: TransactionType): t is 'expense_fixed' | 'expense_variable'`.
  - `isInvestmentType(t: TransactionType): t is 'savings' | 'piggy'`.
- [ ] Substituir `t.type.includes('expense')` por `isExpenseType(t.type)` em `control/page.tsx`, `dashboard/page.tsx`, `Sidebar.tsx`, `profile/page.tsx`.
- [ ] Garantir que `String(type).includes('expense')` em `StandardBlock` use o helper.

**Prompt para o agente:**

```
Em fin-app/, endureça os tipos sobre TransactionType.

1) Em fin-app/types/finance.ts, altere:
   - TransactionRecord.type: string  →  TransactionRecord.type: TransactionType.
   - Não mude createdAt: unknown.

2) Crie fin-app/lib/finance.ts com:
   import type { TransactionType } from "@/types/finance";
   export const isExpenseType = (t: TransactionType): t is "expense_fixed" | "expense_variable" => t === "expense_fixed" || t === "expense_variable";
   export const isInvestmentType = (t: TransactionType): t is "savings" | "piggy" => t === "savings" || t === "piggy";

3) Substitua em fin-app/app/(protected)/control/page.tsx, fin-app/app/(protected)/dashboard/page.tsx, fin-app/components/Sidebar.tsx e fin-app/app/(protected)/profile/page.tsx:
   - t.type.includes("expense")    →    isExpenseType(t.type)
   - String(type).includes("expense") em StandardBlock também usa isExpenseType.
   - Onde o código combina "savings" || "piggy", use isInvestmentType.

4) Se algum dado vier do Firestore com type fora do enum, valide com type guard e descarte (não use any/cast cego). Se precisar de cast explícito por causa de Firestore, faça em UM ponto controlado (ex.: ao ler snapshot) com função de parse e console.warn em registros inválidos.

Regras: sem any; sem suprimir TS com //@ts-ignore; lint+build passam ao final.
```

---

## Fase 7 — Endurecer `lib/firebase.ts` (sem chaves reais hardcoded)

**Objetivo:** Não publicar chaves reais no bundle de produção via fallback hardcoded.

**Estado atual:** `fin-app/lib/firebase.ts` define fallbacks com `apiKey`, `projectId`, `appId` reais. Embora `NEXT_PUBLIC_*` seja exposto ao cliente por design, **gravar as chaves no fonte** vincula o repositório ao projeto Firebase específico do dono e atrapalha quem faz fork.

**Tarefas:**

- [ ] Remover os `??` com strings reais e exigir `process.env.NEXT_PUBLIC_FIREBASE_*` (ou `NEXT_PUBLIC_FIREBASE_*` injetado em build CI dummy).
- [ ] Em `development`, se faltar alguma chave, `console.warn` listando quais.
- [ ] Em `production`, se faltar alguma chave, `throw new Error('Faltam variáveis NEXT_PUBLIC_FIREBASE_*: ...')` (falha explícita já no boot).
- [ ] Atualizar `fin-app/README.md` (seção "Variáveis de ambiente") com o novo comportamento.
- [ ] Garantir que catch de erro nunca fica vazio.

**Prompt para o agente:**

```
Em fin-app/lib/firebase.ts, remova fallbacks com chaves reais hardcoded.

Implementação desejada:
1) Construa firebaseConfig só a partir de process.env.NEXT_PUBLIC_FIREBASE_* (sem `?? "..."`).
2) Calcule a lista de variáveis ausentes em uma função getMissingFirebaseEnv(): string[].
3) Se NODE_ENV === "development" e houver ausentes:
   console.warn(`[firebase] Variáveis ausentes: ${missing.join(", ")}. Copie .env.example para .env.local.`)
4) Se NODE_ENV === "production" e houver ausentes:
   throw new Error(`[firebase] Variáveis NEXT_PUBLIC_FIREBASE_* ausentes: ${missing.join(", ")}`)
5) Mantenha o initializeApp/getApp como hoje. Sem any. Sem catch vazio.

Atualize fin-app/README.md (seção "Variáveis de ambiente"): explicite que o app não sobe em produção sem as envs e que em dev exibe console.warn em vez de fallback.

Atualize fin-app/.env.example só se faltar alguma chave (não devia faltar).

Verifique fin-app/.github/workflows/ci.yml (se existir): garanta que ele exporta valores dummy das envs para build passar.

Regras: pt-BR; build deve continuar passando localmente (com .env.local) e em CI (com dummy); sem any; lint passa.
```

---

## Fase 8 — Refactor de `control/page.tsx`

**Objetivo:** Quebrar o arquivo monolítico (~48 KB) em componentes e hooks reutilizáveis, sem mudar comportamento.

**Estado atual:** `fin-app/app/(protected)/control/page.tsx` define no mesmo arquivo: `TopSummaryCard`, `AccountBlock`, `CreditCardBlock`, `StandardBlock`, `PiggyBlock`, ~15 estados de modal/form, três `onSnapshot` (transactions, cards, accounts) e ~10 handlers.

**Tarefas:**

- [ ] Criar `fin-app/components/control/` com um arquivo por componente:
  - `TopSummaryCard.tsx`, `AccountBlock.tsx`, `CreditCardBlock.tsx`, `StandardBlock.tsx`, `PiggyBlock.tsx`.
- [ ] Criar `fin-app/lib/hooks/useUserCollection.ts` ou hooks específicos: `useTransactions`, `useCards`, `useAccounts`. Cada hook recebe `uid` e devolve `{ data, loading, error }`. Internamente faz `onSnapshot` e cleanup.
- [ ] `control/page.tsx` passa a importar hooks e componentes; mantém apenas a orquestração de modais e handlers de save/delete.
- [ ] Não introduzir `useMemo`/`useCallback` desnecessários; só onde haja cálculo pesado real (ex.: filtros sobre transactions de centenas de itens).
- [ ] Manter o comportamento: mesmas tabelas, mesmos toasts, mesmos estilos.

**Prompt para o agente:**

```
Refatore fin-app/app/(protected)/control/page.tsx (monolítico, ~564 linhas) sem alterar comportamento visível.

Passo a passo:

1) Crie fin-app/components/control/ e mova um componente por arquivo (mantendo as props já existentes em fin-app/types/finance.ts):
   - TopSummaryCard.tsx (TopSummaryCardProps)
   - AccountBlock.tsx (AccountBlockProps)
   - CreditCardBlock.tsx (CreditCardBlockProps)
   - StandardBlock.tsx (StandardBlockProps)
   - PiggyBlock.tsx (PiggyBlockProps)
   Cada arquivo: "use client" no topo apenas se realmente usar hooks; senão, export default puro.

2) Extraia listeners para hooks em fin-app/lib/hooks/:
   - useTransactions(uid: string | undefined): { transactions: TransactionRecord[]; loading: boolean }
   - useCards(uid: string | undefined): { cards: CardRecord[]; loading: boolean }
   - useAccounts(uid: string | undefined): { accounts: AccountRecord[]; loading: boolean }
   Cada hook usa onSnapshot, cleanup no return e console.error em onSnapshot error.

3) control/page.tsx passa a:
   - Importar hooks e componentes acima.
   - Manter apenas estados de modais e handlers (handleSave*, handleDelete*, handleConfirmPayBill, etc.).
   - Importar constantes de fin-app/lib/constants.ts (já feito na Fase 5).
   - Substituir toFixed/toLocaleString por formatBRL (Fase 5).

4) Não use useMemo/useCallback "preventivamente". Use apenas se você medir/identificar custo (ex.: filter+reduce sobre transactions com >300 itens em CreditCardBlock).

5) Acessibilidade mínima durante o refactor (mais detalhes na Fase 11): IconButton com Settings/Edit/Delete passa a ter aria-label descritivo (ex.: "Editar conta {nome}", "Excluir cartão {nome}").

6) Catch nunca vazio: handleSaveAccount, handleDeleteAccount, handleConfirmPayBill, handleSave, handleDelete etc. devem usar try/catch com console.error e toast.error("Mensagem amigável em pt-BR").

Validação final:
- npm run lint e npm run build passam em fin-app/.
- Nenhuma alteração na UI (mesmas tabelas, modais, totais e cores).
- Sem any.
```

---

## Fase 9 — Refactor de `dashboard/page.tsx` + memoization correta

**Objetivo:** Quebrar o arquivo (~30 KB) em widgets focados e memoizar os cálculos pesados que rodam a cada render.

**Estado atual:** `fin-app/app/(protected)/dashboard/page.tsx` calcula `yearlyTrendData`, `topExpensesData`, `incomeSourceData`, `expensesByCategory`, `paymentMethodsData`, `gaugeData` no corpo da função, sem `useMemo` — todos refazem `filter+reduce` sobre `transactions` em cada render (incluindo durante drag do grid).

**Tarefas:**

- [ ] Criar `fin-app/components/dashboard/` com:
  - `EvolucaoFinanceira.tsx`, `TopDespesas.tsx`, `MetaInvestimento.tsx`, `EvolucaoLucro.tsx`, `EvolucaoRendimentos.tsx`, `EvolucaoDespesas.tsx`, `CustomTooltip.tsx`, `PieInteractive.tsx` (se aplicável).
- [ ] Memoizar com `useMemo` os 5 datasets pesados, dependentes de `transactions`, `currentMonth`, `currentYear`, `isDarkMode`.
- [ ] Mover `MONTHS_LIST`, `SEMANTIC_COLORS`, `CHART_PALETTE`, `DEFAULT_LAYOUT` para `lib/constants.ts` (Fase 5).
- [ ] `dashboard/page.tsx` foca em: carregar dados (hook `useTransactions` da Fase 8), carregar/salvar layout do grid, renderizar `<DashboardGrid>` com os widgets.
- [ ] Garantir tipagem do `CustomTooltip` (já existe; manter).

**Prompt para o agente:**

```
Refatore fin-app/app/(protected)/dashboard/page.tsx sem alterar comportamento visível.

1) Mova MONTHS_LIST, SEMANTIC_COLORS, CHART_PALETTE, DEFAULT_LAYOUT para fin-app/lib/constants.ts (se ainda não estiverem) e importe.

2) Crie fin-app/components/dashboard/ com um widget por arquivo. Cada widget recebe os dados já calculados via props (não recebe a lista bruta de transactions):
   - EvolucaoFinanceira.tsx (recebe yearlyTrendData)
   - TopDespesas.tsx (recebe topExpensesData)
   - MetaInvestimento.tsx (recebe gaugeData, totalInvestedGlobal, percentageGoal)
   - EvolucaoLucro.tsx (recebe yearlyTrendData)
   - EvolucaoRendimentos.tsx (recebe incomeSourceData, totalIncomeValue)
   - EvolucaoDespesas.tsx (recebe expensesByCategory, paymentMethodsData)
   - CustomTooltip.tsx (componente compartilhado de tooltip Recharts).

3) Em dashboard/page.tsx:
   - Use o hook useTransactions(user?.uid) (criado na Fase 8) ao invés de onSnapshot inline.
   - Memoize com useMemo, dependendo de [transactions, currentMonth, currentYear, isDarkMode]:
       yearlyTrendData, topExpensesData, totalInvestedGlobal, percentageGoal, gaugeData,
       incomeSourceData, totalIncomeValue, expensesByCategory, paymentMethodsData.
   - Mantenha handleLayoutChange como useCallback (já é).
   - Não reintroduza useMemo onde não há cálculo (evite over-memo).

4) Mantenha o dynamic import sem SSR de DashboardGrid e o skeleton existente.

5) Substitua R$ formatado por formatBRL (Fase 5) e datas por formatDateBR onde aplicável.

6) Sem any. Catch dos try existentes (loadLayout, saveToDb) já fazem console.error — mantenha. Adicione um toast.error amigável em saveToDb se falhar (não bloqueie a UI).

Validação:
- npm run lint e npm run build passam.
- Comportamento visual idêntico (mesmos gráficos, mesma navegação Tabs, mesmo grid arrastável).
- Sem any; sem regressão de tipo.
```

---

## Fase 10 — Performance no `Sidebar`

**Objetivo:** Evitar `filter+reduce` repetido em cada render do `Sidebar` (que vive em todas as rotas protegidas).

**Tarefas:**

- [ ] Memoizar com `useMemo` em `fin-app/components/Sidebar.tsx`: `totalIncome`, `totalExpense`, `globalBalance`, `totalInvested`, `totalLimit`, `usedLimit`, `availableLimit`. Dependências: `transactions`, `cards`.
- [ ] Manter `handleLogout` como `useCallback` (estabilidade ao passar para handlers de Button) — já está bom; só garantir.
- [ ] Não memoizar `menuItems` (objeto literal, render simples).

**Prompt para o agente:**

```
Em fin-app/components/Sidebar.tsx, memoize cálculos derivados que hoje rodam em todo render.

1) Substitua os cálculos atuais por useMemo:
   - totals = useMemo(() => ({
       totalIncome, totalExpense, globalBalance,
       totalInvested,
       totalLimit, usedLimit, availableLimit,
     }), [transactions, cards]);
   E desestruture totals na render.

2) Mantenha handleLogout como useCallback se já for; ou converta para useCallback uma única vez.

3) Não envolva menuItems em useMemo (não compensa).

4) Mantenha A11y: o bloco clicável de perfil hoje é um <Box onClick=...>; troque para <ButtonBase> (MUI) com aria-label "Abrir resumo do perfil", role="button" e tabIndex já gerenciado pelo MUI. (Mais a fundo na Fase 11.)

Regras: pt-BR; sem any; sem mudança visual; lint+build passam.
```

---

## Fase 11 — Acessibilidade (a11y)

**Objetivo:** Cumprir a regra de A11y do projeto: `aria-label` em ícones isolados, hierarquia de headings, alternativas a `prompt`/`confirm` nativos.

**Estado atual:** Existem dezenas de `<IconButton>` com apenas ícone (`<Settings/>`, `<Edit/>`, `<DeleteOutline/>`, `<History/>`, `<PhotoCamera/>`, `<Logout/>`) sem `aria-label`. Páginas começam com `<Typography variant="h4">` em vez de `<h1>` real. `settings/page.tsx` usa `prompt('Digite "DELETAR"')` e `profile/page.tsx` usa `confirm()` duplo.

**Tarefas:**

- [ ] Adicionar `aria-label` descritivo em todo `IconButton` somente-ícone em `Sidebar.tsx`, `control/page.tsx` (sub-componentes refatorados na Fase 8) e `settings/page.tsx`.
- [ ] Em cada página `(protected)/*/page.tsx`, garantir uma `<Typography variant="h4" component="h1">` (ou similar) para que o leitor de tela enxergue um `<h1>` único.
- [ ] Substituir `prompt("Digite 'DELETAR'…")` em `settings/page.tsx` por um `Dialog` MUI com `TextField` que exige a palavra "DELETAR" para habilitar o botão.
- [ ] Substituir os dois `confirm()` em `profile/page.tsx` por um `Dialog` MUI de confirmação destrutiva (ou aplicar o redirect da Fase 12 e remover a tela inteira).
- [ ] `Switch` de tema com `inputProps={{ 'aria-label': 'Alternar tema escuro/claro' }}`.
- [ ] `<input type="file" hidden>` mantém label visível ("Carregar do PC" / `<PhotoCamera/>`); garantir `aria-label` no botão que dispara.

**Prompt para o agente:**

```
Aplique melhorias de acessibilidade no fin-app, sem mudanças visuais.

1) Em todo IconButton SOMENTE-ícone, adicione aria-label descritivo em pt-BR:
   - Sidebar.tsx: o Logout vira <Button aria-label="Sair da conta"> (já é Button, só garanta o aria-label).
   - control/page.tsx (e seus subcomponentes da Fase 8): "Editar conta {account.name}", "Editar cartão {card.name}", "Excluir transação", "Ver histórico de {bank}", etc.
   - settings/page.tsx: PhotoCamera vira <IconButton aria-label="Trocar foto de perfil">.
   - Qualquer outro IconButton só com ícone deve receber aria-label.

2) Hierarquia de headings:
   - Em cada page.tsx de (protected), o título principal usa <Typography variant="h4" component="h1">.
   - Sub-blocos importantes usam variant="h6" component="h2".

3) Substitua prompt() em fin-app/app/(protected)/settings/page.tsx (handleResetAccount):
   - Crie um Dialog MUI com TextField "Digite DELETAR para confirmar".
   - Botão "Apagar Tudo" só fica enabled quando o texto === "DELETAR".
   - aria-labelledby/aria-describedby no Dialog.
   - Mantenha o batch.delete atual.

4) Em fin-app/app/(protected)/profile/page.tsx (se ainda existir após Fase 12):
   - Substitua os dois confirm() por um Dialog MUI de confirmação destrutiva com 2 etapas (texto + botão "Excluir minha conta"), aria-label apropriado.

5) Em fin-app/app/(protected)/settings/page.tsx, no Switch de tema:
   <Switch checked={isDarkMode} onChange={toggleTheme} inputProps={{ 'aria-label': 'Alternar tema escuro/claro' }} />

Regras: sem any; sem mudança de aparência; manter regra de catch nunca vazio; lint+build passam.
```

---

## Fase 12 — Unificar `/settings` e `/profile`

**Objetivo:** Acabar com a duplicidade entre `settings` (canônico) e `profile` (legado), apontada no `fin-app/README.md`.

**Estado atual:**

- `Sidebar` já navega para `/settings` (não há link para `/profile`).
- `profile/page.tsx` usa cores **hardcoded** (`#fff`, `#18191d`, `#27272a`, `#7c3aed`...), ignorando o tema claro.
- `settings/page.tsx` já cobre: editar nome+foto (Storage), trocar senha, exportar CSV, zerar dados.
- O que `profile/page.tsx` tem de extra: "Resumo da conta" (patrimônio líquido, contagem de itens, membro desde) e "Zona de perigo: Excluir conta" (não só zerar dados, deleta o usuário do Auth).

**Tarefas:**

- [ ] Decidir: manter `/settings` como canônico, criar redirect em `/profile` e migrar o que for útil.
- [ ] Em `fin-app/app/(protected)/profile/page.tsx`, substituir tudo por um `redirect('/settings')` server-side (ou um `useEffect` client-side com `router.replace`, mas o redirect server é mais limpo).
- [ ] Em `settings/page.tsx`, adicionar (usando `colors` do `useAppTheme`):
  - Mini "Resumo" com `formatBRL(globalBalance)` e contagem de transações.
  - "Zona de perigo: Excluir conta" com `Dialog` (Fase 11) e `reauthenticateWithCredential` (Fase 13).
- [ ] Atualizar `fin-app/README.md` (tabela de rotas: remover `/profile`; remover nota "duplicado").

**Prompt para o agente:**

```
Em fin-app, unifique /settings e /profile. /settings é canônico.

1) Substitua TODO o conteúdo de fin-app/app/(protected)/profile/page.tsx por:
   import { redirect } from "next/navigation";
   export default function ProfilePage() { redirect("/settings"); }
   (Página é Server Component por padrão; sem "use client".)

2) Em fin-app/app/(protected)/settings/page.tsx, ADICIONE blocos novos usando colors do useAppTheme (NUNCA hardcoded como em profile/page.tsx):
   a) "Resumo da conta": patrimônio líquido = totalIncome - totalExpense (use isExpenseType da Fase 6), contagem de itens, "membro desde" via user.metadata.creationTime.
      Mostre valores monetários com formatBRL.
   b) "Zona de perigo: Excluir conta" (use Dialog da Fase 11).
      - Botão "Excluir minha conta" abre Dialog que requer digitar "EXCLUIR".
      - On confirm: tente reauthenticateWithCredential (Fase 13) se houver provider de email; em seguida deleteUser; depois router.push('/login') e toast.success.
      - Em catch, console.error e toast.error com mensagem específica para auth/requires-recent-login.

3) Atualize fin-app/README.md:
   - Tabela de rotas: remova /profile (pois agora é só redirect).
   - Remova a nota "Perfil duplicado" da seção "Pontos de atenção".

Regras: sem any; sem cores hardcoded em settings (use colors.* e theme MUI); a11y conforme Fase 11; lint+build passam; pt-BR.
```

---

## Fase 13 — Reauth + ações destrutivas seguras + CSV escapado

**Objetivo:** Robustez nas ações sensíveis e correção de injeção/quebra de CSV.

**Estado atual:**

- `settings/page.tsx#handleChangePassword` trata `auth/requires-recent-login` apenas mostrando toast (não reautentica).
- `profile/page.tsx#handleDeleteAccount` mesma coisa.
- `settings/page.tsx#handleExportData` concatena strings em CSV sem escape: `${d.description}` quebra se a descrição contém vírgula, aspas ou quebra de linha.

**Tarefas:**

- [ ] Em `handleChangePassword` (settings) e na exclusão de conta (após Fase 12, dentro de settings):
  - Detectar `auth/requires-recent-login`.
  - Pedir senha atual via `Dialog` e chamar `reauthenticateWithCredential(currentUser, EmailAuthProvider.credential(email, password))` antes de tentar de novo.
  - Cobrir só o caso de provider email/senha (atual do app); para outros providers, mostrar toast pedindo logout/login.
- [ ] Em `handleExportData`, gerar CSV com escape RFC 4180:
  - Helper `escapeCSV(value: unknown): string` que envolve com aspas e duplica `"` quando o valor contém `,`, `"`, `\n` ou `\r`.
  - Usar `\r\n` como separador de linha.
  - `Blob` + `URL.createObjectURL` em vez de `data:text/csv;...` + `encodeURI` (mais robusto para acentos).
  - `URL.revokeObjectURL` no final.
- [ ] Toda a Fase 13 mantém regra: `try/catch` com `console.error` + `toast.error` específico.

**Prompt para o agente:**

```
Em fin-app/, endureça ações destrutivas e exportação de dados.

1) Em fin-app/app/(protected)/settings/page.tsx, no handleChangePassword:
   - Quando o erro for auth/requires-recent-login, abra um Dialog "Confirmar senha atual" com TextField type="password".
   - Use:
     import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
     const cred = EmailAuthProvider.credential(currentUser.email!, currentPassword);
     await reauthenticateWithCredential(currentUser, cred);
     await updatePassword(currentUser, newPass);
   - toast.success ao final; toast.error específico se senha errada (auth/wrong-password / auth/invalid-credential).

2) Replique o mesmo fluxo de reauth no botão "Excluir minha conta" (que vive em settings após Fase 12):
   - reauthenticateWithCredential antes de deleteUser, batch.delete de transactions/cards/accounts e router.push('/login').

3) Substitua handleExportData por uma versão segura:
   const escapeCSV = (raw: unknown): string => {
     const v = raw == null ? "" : String(raw);
     return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
   };
   const headers = ["data","descricao","categoria","valor","tipo","banco"];
   const rows = snapshot.docs.map(d => {
     const x = d.data();
     return [x.date, x.description, x.category, x.amount, x.type, x.bank].map(escapeCSV).join(",");
   });
   const csv = "\uFEFF" + headers.join(",") + "\r\n" + rows.join("\r\n");
   const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url; a.download = "meus_gastos.csv"; a.click();
   URL.revokeObjectURL(url);

   Mantenha estado exporting + try/catch com console.error e toast.error("Erro ao exportar.").

Regras: sem any; type guards quando ler error desconhecido (já existem em settings); pt-BR; lint+build passam.
```

---

## Fase 14 — Testes automatizados (Vitest)

**Objetivo:** Base mínima de regressão sobre os módulos puros extraídos nas Fases 5/6/8/9.

**Tarefas:**

- [ ] Adicionar Vitest e dependências necessárias em `fin-app/package.json`.
- [ ] Criar `fin-app/vitest.config.ts` (alinhar `@/` com `tsconfig` do Next).
- [ ] Adicionar scripts `"test": "vitest run"` e `"test:watch": "vitest"`.
- [ ] Escrever testes para `fin-app/lib/format.ts` (`formatBRL`, `parseISODateUTC`, `formatDateBR`) e `fin-app/lib/finance.ts` (`isExpenseType`, `isInvestmentType`, e — se extraído nas Fases 8/9 — cálculo de saldo de conta e fatura corrente).
- [ ] Documentar em `fin-app/README.md` na seção Comandos.

**Prompt para o agente:**

```
No fin-app (Next 16, TS strict), adicione Vitest para funções puras.

1) Dependências dev (instalar com npm):
   - vitest
   - @vitest/ui (opcional)
   Não adicione @vitejs/plugin-react agora; testes alvo são funções puras.

2) Crie fin-app/vitest.config.ts com alias "@" apontando para a raiz do fin-app (mesmo do tsconfig.json paths):
   import { defineConfig } from "vitest/config";
   import path from "node:path";
   export default defineConfig({
     resolve: { alias: { "@": path.resolve(__dirname) } },
     test: { environment: "node", include: ["**/*.test.ts"] },
   });

3) Em fin-app/package.json adicione scripts:
   "test": "vitest run",
   "test:watch": "vitest"

4) Crie testes:
   - fin-app/lib/format.test.ts: formatBRL(0) === "R$ 0,00"; formatBRL(1234.5) === "R$ 1.234,50"; parseISODateUTC("2026-05-04").toISOString() === "2026-05-04T00:00:00.000Z"; formatDateBR("2026-05-04") === "04/05/2026".
   - fin-app/lib/finance.test.ts: isExpenseType("expense_fixed") === true; isExpenseType("income") === false; isInvestmentType("piggy") === true; etc.

5) Documente em fin-app/README.md (seção Comandos): npm test e npm run test:watch.

Regras: sem any; testes determinísticos; npm run lint e npm test passam.
```

---

## Fase 15 — Screenshot ou GIF no README da raiz

**Objetivo:** Melhorar a primeira impressão no GitHub.

**Tarefas:**

- [ ] Criar pasta `docs/assets/` na raiz (se não existir).
- [ ] Salvar `dashboard.png` (placeholder ou imagem real fornecida pelo dono).
- [ ] Referenciar no `README.md` da raiz com caminho relativo `![FinApp — dashboard](docs/assets/dashboard.png)`.

**Prompt para o agente:**

```
No repositório dash-financeiro: adicionar uma imagem de demonstração ao README da raiz.

1) Crie a pasta docs/assets na raiz se não existir e adicione um placeholder leve (SVG simples ou um README.md interno explicando o que é esperado: dashboard.png em ~1280x720).
2) Atualize README.md na raiz com a imagem (após a descrição e antes do Quick start):
   ![FinApp — dashboard](docs/assets/dashboard.png)
3) Inclua uma linha dizendo que a imagem é opcional e o nome esperado.

Não commite binários grandes sem necessidade; se for placeholder, prefira SVG leve. Pt-BR; sem mexer em código da aplicação.
```

---

## Fase 16 — Checklist final de revisão

**Objetivo:** Validar que todas as fases anteriores convivem.

**Tarefas:**

- [ ] `cd fin-app && npm run lint && npm run build && npm test` passam localmente.
- [ ] CI (Fase 4) verde no PR.
- [ ] Não há `any`, `console.log` esquecido, `prompt`/`confirm` nativo nem `try/catch` vazio nas pastas de aplicação.
- [ ] `fin-app/README.md` e `README.md` da raiz coerentes (sem links quebrados; tabela de rotas sem `/profile`).
- [ ] `.env.local` ausente do git.
- [ ] Aplicação visualmente equivalente ao estado anterior (cobre dashboards, controle, login, settings).

**Prompt para o agente:**

```
Faça revisão final do repositório dash-financeiro:

1) Em fin-app, rode npm run lint, npm run build e npm test; corrija o que estiver quebrado por mudanças anteriores.
2) Procure (e remova) any, console.log fora de catch, prompt(), confirm() e try/catch vazio nas pastas: fin-app/app/**, fin-app/components/**, fin-app/lib/**, fin-app/context/**.
3) Verifique README.md raiz e fin-app/README.md: links relativos, comandos atualizados, tabela de rotas sem /profile, nota de "duplicado" removida.
4) Confirme .gitignore ignora .env.local e arquivos sensíveis.
5) Liste em bullet points o que foi verificado e o resultado, em pt-BR. Não abra escopo novo.
```

---

## Ordem sugerida

- **Quick wins** (alto valor, baixo risco): 1 → 2 → 3 → 4 → 15.
- **Bases para o resto** (sem refactor visível): 5 → 6 → 7.
- **Refactor estrutural**: 8 → 9 → 10.
- **Qualidade de produto**: 11 → 12 → 13.
- **Rede de segurança**: 14 → 16.

---

## Nota para o dono do repositório

Cada prompt foi escrito para ser **autossuficiente**: um agente pode pegar uma fase isolada sem precisar do histórico das outras. As regras do projeto (pt-BR, sem `any`, `try/catch` com feedback, A11y, loading/disabled, `useMemo`/`useCallback` só quando necessário) estão repetidas dentro de cada prompt para que o agente alvo não precise procurá-las em outro lugar.

Se o agente não tiver terminal, peça explicitamente: "execute os comandos no terminal integrado e corrija até passar (`npm run lint`, `npm run build`, `npm test`)".
