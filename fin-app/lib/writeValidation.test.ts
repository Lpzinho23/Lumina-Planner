import { describe, expect, it } from "vitest";
import {
  sanitizeAccountInput,
  sanitizeCardInput,
  sanitizeTransactionInput,
} from "./writeValidation";

describe("writeValidation", () => {
  it("sanitiza conta com limites e trim", () => {
    const result = sanitizeAccountInput({
      name: "  Conta Principal  ",
      initialBalance: "123.45",
      color: "#123456",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Conta Principal");
      expect(result.data.initialBalance).toBe(123.45);
    }
  });

  it("rejeita cartão sem nome válido", () => {
    const result = sanitizeCardInput({ name: "   ", limit: 1000, color: "#000" });
    expect(result.ok).toBe(false);
  });

  it("rejeita transação com valor inválido", () => {
    const result = sanitizeTransactionInput({
      type: "income",
      description: "Teste",
      category: "Salário",
      amount: Number.NaN,
      paymentMethod: "Pix",
      bank: "Conta",
      status: "Recebido",
      date: "2026-01-01",
    });
    expect(result.ok).toBe(false);
  });
});
