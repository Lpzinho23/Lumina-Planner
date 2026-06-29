import { describe, expect, it } from "vitest";
import { sanitizeDashboardLayout } from "./layoutValidation";

describe("sanitizeDashboardLayout", () => {
  it("aceita layout válido", () => {
    const result = sanitizeDashboardLayout([
      { i: "a", x: 0, y: 0, w: 6, h: 4 },
      { i: "b", x: 6, y: 0, w: 6, h: 4 },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
    }
  });

  it("remove itens inválidos e falha quando nada sobra", () => {
    const result = sanitizeDashboardLayout([{ i: "", x: NaN, y: 0, w: 0, h: -1 }]);
    expect(result.ok).toBe(false);
  });
});
