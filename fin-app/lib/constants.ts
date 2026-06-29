import type { DashboardGridLayoutItem } from "@/types/finance";

export const MONTHS_LIST = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const BANKS_FOR_EXPENSES = [
  "Nubank",
  "Inter",
  "Itaú",
  "Bradesco",
  "Santander",
  "Caixa",
  "Mercado Pago",
  "PicPay",
  "C6 Bank",
  "Pix",
  "Carteira",
  "Cofre",
  "Vale Refeição",
  "Vale Alimentação",
  "XP Investimentos",
  "Rico",
  "Sofisa Direto",
] as const;

export const BANKS_FOR_INVESTMENTS = [
  "Nubank",
  "Inter",
  "Itaú",
  "Bradesco",
  "Santander",
  "Caixa",
  "Mercado Pago 100% CDI",
  "Mercado Pago 105% CDI",
  "Mercado Pago 115% CDI",
  "PicPay",
  "C6 Bank",
  "Pix",
  "XP Investimentos",
  "Rico",
  "Sofisa Direto",
] as const;

export const CATEGORIES_DEFAULT = [
  "Estudos",
  "Casa",
  "Assinaturas",
  "Carro",
  "Saúde e Fitness",
  "Mercado",
  "Lazer",
  "Alimentação",
  "Outros",
  "Pagamento de Fatura",
] as const;

export const CARD_COLORS = [
  { name: "Roxo Nubank", hex: "#820ad1" },
  { name: "Azul Mercado Pago", hex: "#009ee3" },
  { name: "Laranja Inter", hex: "#ff7a00" },
  { name: "Vermelho Bradesco", hex: "#cc092f" },
  { name: "Preto Carbon", hex: "#111111" },
  { name: "Verde", hex: "#10b981" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "VR / Sodexo", hex: "#ef4444" },
  { name: "Alelo / Ticket", hex: "#14b8a6" },
] as const;

export const PAYMENT_METHODS = [
  "Crédito",
  "Débito",
  "Pix",
  "Dinheiro",
  "Boleto",
  "Vale Refeição",
  "Vale Alimentação",
] as const;

export const RECEIPT_METHODS = [
  "Pix",
  "Depósito",
  "Dinheiro",
  "Benefício (VR/VA)",
] as const;

/** CDI anual de referência para estimativas do cofrinho (percentual). */
export const CDI_ANUAL_ATUAL = 13.15;

export const META_MENSAL_PIGGY = 300;
export const META_ANUAL_INVEST = 40000;

export const SEMANTIC_COLORS = {
  income: "#4ade80",
  fixed: "#fbbf24",
  variable: "#f87171",
  savings: "#60a5fa",
  balance: "#3b82f6",
  piggy: "#c084fc",
  neutral: "#e4e4e7",
  neutralDark: "#333",
} as const;

export const CHART_PALETTE = [
  "#60a5fa",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fbbf24",
  "#f87171",
  "#22d3ee",
] as const;

/** Grade 12 cols: linha 1 inteira; linha 2 em três colunas iguais; linha 3 em duas metades. */
export const DEFAULT_LAYOUT: DashboardGridLayoutItem[] = [
  { i: "evolucao_fin", x: 0, y: 0, w: 12, h: 5 },
  { i: "top_despesas", x: 0, y: 5, w: 4, h: 4 },
  { i: "evolucao_luc", x: 4, y: 5, w: 4, h: 4 },
  { i: "meta_inv", x: 8, y: 5, w: 4, h: 4 },
  { i: "evolucao_ren", x: 0, y: 9, w: 6, h: 4 },
  { i: "evolucao_des", x: 6, y: 9, w: 6, h: 4 },
];
