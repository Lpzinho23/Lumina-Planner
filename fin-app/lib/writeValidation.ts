import { isTransactionType } from "./finance";
import type { TransactionType } from "@/types/finance";
import { VALIDATION_MESSAGES } from "./validationMessages";

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

type AccountInput = { name: string; initialBalance: number | string; color: string };
type CardInput = { name: string; limit: number | string; color: string };
type TransactionInput = {
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  bank: string;
  status: string;
  date: string;
  yieldRate?: number;
};

function toTrimmed(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function toFinite(input: unknown): number | null {
  const value = typeof input === "number" ? input : Number(input);
  return Number.isFinite(value) ? value : null;
}

export function sanitizeAccountInput(input: AccountInput): ValidationResult<AccountInput> {
  const name = toTrimmed(input.name).slice(0, 60);
  if (!name) return { ok: false, message: VALIDATION_MESSAGES.requiredAccountName };
  const initialBalance = toFinite(input.initialBalance);
  if (initialBalance === null) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidInitialBalance };
  }
  return { ok: true, data: { name, initialBalance, color: toTrimmed(input.color).slice(0, 20) } };
}

export function sanitizeCardInput(input: CardInput): ValidationResult<CardInput> {
  const name = toTrimmed(input.name).slice(0, 60);
  if (!name) return { ok: false, message: VALIDATION_MESSAGES.requiredCardName };
  const limit = toFinite(input.limit);
  if (limit === null || limit < 0) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidCardLimit };
  }
  return { ok: true, data: { name, limit, color: toTrimmed(input.color).slice(0, 20) } };
}

export function sanitizeTransactionInput(
  input: TransactionInput,
): ValidationResult<TransactionInput> {
  if (!isTransactionType(input.type)) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidTransactionType };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidTransactionAmount };
  }
  const date = toTrimmed(input.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidTransactionDate };
  }
  const description = toTrimmed(input.description).slice(0, 120);
  const category = toTrimmed(input.category).slice(0, 60);
  const paymentMethod = toTrimmed(input.paymentMethod).slice(0, 40);
  const bank = toTrimmed(input.bank).slice(0, 80);
  const status = toTrimmed(input.status).slice(0, 40);
  const normalized: TransactionInput = {
    ...input,
    description,
    category,
    paymentMethod,
    bank,
    status,
    date,
  };
  if (input.yieldRate != null && !Number.isFinite(input.yieldRate)) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidYieldRate };
  }
  return { ok: true, data: normalized };
}
