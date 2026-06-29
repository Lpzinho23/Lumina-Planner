import { describe, expect, it } from "vitest";
import { getAuthFriendlyMessage } from "./authErrors";

describe("authErrors", () => {
  it("retorna mensagem específica para email já cadastrado", () => {
    expect(getAuthFriendlyMessage("auth/email-already-in-use")).toBe(
      "Este e-mail já está em uso.",
    );
  });

  it("retorna mensagem padrão para código desconhecido", () => {
    expect(getAuthFriendlyMessage("auth/unknown-code")).toBe(
      "Não foi possível concluir a operação. Tente novamente.",
    );
  });
});
