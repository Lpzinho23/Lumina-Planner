import type {
  AccountRecord,
  CardRecord,
  TransactionRecord,
  TransactionType,
} from "@/types/finance";

export const isExpenseType = (
  t: TransactionType,
): t is "expense_fixed" | "expense_variable" =>
  t === "expense_fixed" || t === "expense_variable";

export const isInvestmentType = (
  t: TransactionType,
): t is "savings" | "piggy" => t === "savings" || t === "piggy";

const TRANSACTION_TYPES: readonly TransactionType[] = [
  "income",
  "expense_fixed",
  "expense_variable",
  "savings",
  "piggy",
];

export const isTransactionType = (v: unknown): v is TransactionType =>
  typeof v === "string" &&
  (TRANSACTION_TYPES as readonly string[]).includes(v);

function numFromUnknown(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function strFromUnknown(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Converte documento Firestore em registro tipado; ignora tipos inválidos. */
export function parseFirestoreTransaction(
  id: string,
  data: Record<string, unknown>,
): TransactionRecord | null {
  if (!isTransactionType(data.type)) {
    console.warn(
      "[transactions] Registro ignorado: tipo inválido",
      id,
      data.type,
    );
    return null;
  }
  const date =
    typeof data.date === "string"
      ? data.date
      : data.date != null
        ? String(data.date)
        : "";
  return {
    id,
    type: data.type,
    amount: numFromUnknown(data.amount),
    date,
    description:
      typeof data.description === "string" ? data.description : undefined,
    category: typeof data.category === "string" ? data.category : undefined,
    paymentMethod:
      typeof data.paymentMethod === "string"
        ? data.paymentMethod
        : undefined,
    bank: typeof data.bank === "string" ? data.bank : undefined,
    status: typeof data.status === "string" ? data.status : undefined,
    yieldRate:
      typeof data.yieldRate === "number"
        ? data.yieldRate
        : data.yieldRate != null
          ? numFromUnknown(data.yieldRate)
          : undefined,
    createdAt: data.createdAt,
  };
}

export function parseFirestoreAccount(
  id: string,
  data: Record<string, unknown>,
): AccountRecord | null {
  const name = strFromUnknown(data.name);
  if (!name) {
    console.warn("[accounts] Registro ignorado: nome inválido", id, data.name);
    return null;
  }
  const color = strFromUnknown(data.color);
  return {
    id,
    name,
    initialBalance:
      data.initialBalance != null ? numFromUnknown(data.initialBalance) : undefined,
    color: color || undefined,
  };
}

export function parseFirestoreCard(
  id: string,
  data: Record<string, unknown>,
): CardRecord | null {
  const name = strFromUnknown(data.name);
  if (!name) {
    console.warn("[cards] Registro ignorado: nome inválido", id, data.name);
    return null;
  }
  const color = strFromUnknown(data.color);
  return {
    id,
    name,
    limit: numFromUnknown(data.limit),
    color: color || undefined,
  };
}
