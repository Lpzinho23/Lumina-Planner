import { describe, expect, it } from "vitest";
import {
  getValidationMessage,
  VALIDATION_MESSAGES,
  type ValidationMessageKey,
} from "./validationMessages";

describe("validationMessages", () => {
  it("expõe mensagens padronizadas para validação", () => {
    expect(VALIDATION_MESSAGES.requiredDisplayName).toBe("Nome é obrigatório.");
    expect(VALIDATION_MESSAGES.invalidDashboardLayout).toBe("Layout inválido.");
    expect(VALIDATION_MESSAGES.invalidTransactionAmount).toBe(
      "Valor da transação inválido.",
    );
  });

  it("resolve mensagem por chave tipada", () => {
    const key: ValidationMessageKey = "invalidCardLimit";
    expect(getValidationMessage(key)).toBe("Limite do cartão inválido.");
  });
});
