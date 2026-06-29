import { describe, expect, it } from "vitest";
import { sanitizeDisplayName } from "./profileValidation";

describe("sanitizeDisplayName", () => {
  it("normaliza nome com trim e limite", () => {
    const result = sanitizeDisplayName("   Lucas Financeiro   ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("Lucas Financeiro");
    }
  });

  it("rejeita nome vazio", () => {
    const result = sanitizeDisplayName("   ");
    expect(result.ok).toBe(false);
  });
});
