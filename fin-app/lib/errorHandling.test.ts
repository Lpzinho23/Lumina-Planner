import { describe, expect, it } from "vitest";
import { extractErrorCode, getReadableErrorMessage } from "./errorHandling";

describe("errorHandling", () => {
  it("extrai code quando erro possui campo code string", () => {
    const code = extractErrorCode({ code: "auth/invalid-credential" });
    expect(code).toBe("auth/invalid-credential");
  });

  it("retorna undefined quando code não é string", () => {
    const code = extractErrorCode({ code: 123 });
    expect(code).toBeUndefined();
  });

  it("retorna mensagem legível quando Error tem message", () => {
    const message = getReadableErrorMessage(new Error("Falha de teste"));
    expect(message).toBe("Falha de teste");
  });

  it("retorna fallback quando erro não possui message válida", () => {
    const message = getReadableErrorMessage({ status: 500 });
    expect(message).toBe("Erro desconhecido");
  });
});
