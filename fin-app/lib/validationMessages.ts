export const VALIDATION_MESSAGES = {
  requiredDisplayName: "Nome é obrigatório.",
  invalidDashboardLayout: "Layout inválido.",
  requiredAccountName: "Nome da conta é obrigatório.",
  invalidInitialBalance: "Saldo inicial inválido.",
  requiredCardName: "Nome do cartão é obrigatório.",
  invalidCardLimit: "Limite do cartão inválido.",
  invalidTransactionType: "Tipo de transação inválido.",
  invalidTransactionAmount: "Valor da transação inválido.",
  invalidTransactionDate: "Data inválida.",
  invalidYieldRate: "Taxa de rendimento inválida.",
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;

export function getValidationMessage(key: ValidationMessageKey): string {
  return VALIDATION_MESSAGES[key];
}
