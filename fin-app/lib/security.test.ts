import { describe, expect, it } from "vitest";
import { validateAvatarFile } from "./security";

function makeFile(
  sizeInBytes: number,
  type: string,
  name = "avatar.png",
): File {
  const blob = new Blob([new Uint8Array(sizeInBytes)], { type });
  return new File([blob], name, { type });
}

describe("validateAvatarFile", () => {
  it("aceita imagem png até o limite", () => {
    const file = makeFile(1024, "image/png");
    const result = validateAvatarFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejeita tipo não permitido", () => {
    const file = makeFile(1024, "application/pdf", "doc.pdf");
    const result = validateAvatarFile(file);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("PNG, JPG");
  });

  it("rejeita arquivo acima do limite de tamanho", () => {
    const file = makeFile(2 * 1024 * 1024 + 1, "image/jpeg", "big.jpg");
    const result = validateAvatarFile(file);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("2MB");
  });
});
