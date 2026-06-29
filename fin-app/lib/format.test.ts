import { describe, expect, it } from "vitest";
import { formatBRL, formatDateBR, parseISODateUTC } from "./format";

describe("format", () => {
  it("formatBRL formata zero e valores com decimais", () => {
    expect(formatBRL(0)).toMatch(/^R\$\s*0,00$/);
    expect(formatBRL(1234.5)).toMatch(/^R\$\s*1\.234,50$/);
  });

  it("parseISODateUTC interpreta YYYY-MM-DD em UTC", () => {
    expect(parseISODateUTC("2026-05-04").toISOString()).toBe(
      "2026-05-04T00:00:00.000Z",
    );
  });

  it("formatDateBR formata em pt-BR com fuso UTC", () => {
    expect(formatDateBR("2026-05-04")).toBe("04/05/2026");
  });
});
