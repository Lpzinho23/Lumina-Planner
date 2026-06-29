import { describe, expect, it } from "vitest";
import {
  isExpenseType,
  isInvestmentType,
  parseFirestoreAccount,
  parseFirestoreCard,
} from "./finance";

describe("finance helpers", () => {
  it("isExpenseType", () => {
    expect(isExpenseType("expense_fixed")).toBe(true);
    expect(isExpenseType("expense_variable")).toBe(true);
    expect(isExpenseType("income")).toBe(false);
    expect(isExpenseType("piggy")).toBe(false);
  });

  it("isInvestmentType", () => {
    expect(isInvestmentType("piggy")).toBe(true);
    expect(isInvestmentType("savings")).toBe(true);
    expect(isInvestmentType("income")).toBe(false);
  });

  it("parseFirestoreAccount retorna conta válida com defaults seguros", () => {
    const parsed = parseFirestoreAccount("acc_1", {
      name: "Nubank",
      initialBalance: "123.45",
      color: "#111111",
    });
    expect(parsed).toEqual({
      id: "acc_1",
      name: "Nubank",
      initialBalance: 123.45,
      color: "#111111",
    });
  });

  it("parseFirestoreAccount ignora registro sem nome válido", () => {
    const parsed = parseFirestoreAccount("acc_2", { initialBalance: 10 });
    expect(parsed).toBeNull();
  });

  it("parseFirestoreCard retorna cartão válido com normalização numérica", () => {
    const parsed = parseFirestoreCard("card_1", {
      name: "Visa Gold",
      limit: "5000",
      color: "#222222",
    });
    expect(parsed).toEqual({
      id: "card_1",
      name: "Visa Gold",
      limit: 5000,
      color: "#222222",
    });
  });

  it("parseFirestoreCard ignora registro sem nome válido", () => {
    const parsed = parseFirestoreCard("card_2", { limit: 1000 });
    expect(parsed).toBeNull();
  });
});
