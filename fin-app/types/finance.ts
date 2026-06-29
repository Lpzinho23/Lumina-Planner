import type { ReactNode } from "react";
import type { ThemeColors } from "@/context/ThemeContext";

export type TransactionType =
  | "income"
  | "expense_fixed"
  | "expense_variable"
  | "savings"
  | "piggy";

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
  bank?: string;
  status?: string;
  yieldRate?: number;
  createdAt?: unknown;
}

/** Linha agregada em “Dinheiro guardado” (UI interna). */
export type AggregatedSavingsRow = TransactionRecord & { _key: string };

/** Linhas agregadas para gráficos (nome + valor). */
export interface ChartLabelRow {
  name: string;
  value: number;
  fill?: string;
}

/** Linha do radar de despesas por categoria. */
export interface RadarExpenseRow {
  subject: string;
  A: number;
  fullMark: number;
}

/** Item de layout persistido do react-grid-layout. */
export interface DashboardGridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AccountRecord {
  id: string;
  name: string;
  initialBalance?: number;
  color?: string;
}

export interface CardRecord {
  id: string;
  name: string;
  limit: number;
  color?: string;
}

export interface TopSummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  bg?: string;
  colors: ThemeColors;
}

export interface AccountBlockProps {
  account: AccountRecord;
  transactions: TransactionRecord[];
  handleOpenAccountModal: (acc?: AccountRecord) => void;
  colors: ThemeColors;
}

export interface CreditCardBlockProps {
  card: CardRecord;
  transactions: TransactionRecord[];
  currentMonth: number;
  currentYear: number;
  handleOpenCardModal: (c?: CardRecord) => void;
  handleOpenPayBill: (c: CardRecord) => void;
  colors: ThemeColors;
  isDarkMode: boolean;
}

export interface StandardBlockProps {
  title: string;
  icon: ReactNode;
  color: string;
  data: TransactionRecord[];
  type: TransactionType;
  columns: string[];
  handleOpen: (type: TransactionType, item?: TransactionRecord) => void;
  handleDelete: (id: string) => void;
  handleOpenExtract?: (bankName: string) => void;
  colors: ThemeColors;
  isDarkMode: boolean;
}

export interface PiggyBlockProps {
  data: TransactionRecord[];
  handleOpen: (type: TransactionType, item?: TransactionRecord) => void;
  handleDelete: (id: string) => void;
  colors: ThemeColors;
  isDarkMode: boolean;
  cdiPercentage: number;
  currentYear: number;
}
