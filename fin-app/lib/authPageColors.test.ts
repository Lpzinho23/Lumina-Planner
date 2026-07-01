import { describe, expect, it } from "vitest";
import { getAuthPageColors } from "./authPageColors";

const lightColors = {
  background: "#eef0f4",
  paper: "#ffffff",
  input: "#f4f4f5",
  text: "#1e1e2e",
  textSecondary: "#6b7280",
  primary: "#7c3aed",
  border: "#e8eaef",
  danger: "#ef4444",
} as const;

const darkColors = {
  background: "#0f1014",
  paper: "#18191d",
  input: "#27272a",
  text: "#ffffff",
  textSecondary: "#a1a1aa",
  primary: "#7c3aed",
  border: "#333333",
  danger: "#ef4444",
} as const;

describe("getAuthPageColors", () => {
  it("usa paleta clara no modo claro", () => {
    const palette = getAuthPageColors(lightColors, false);
    expect(palette.pageBackground).toBe("#eef0f4");
    expect(palette.cardBackground).toBe("#ffffff");
    expect(palette.textMain).toBe("#1e1e2e");
    expect(palette.buttonBg).toBe("#7c3aed");
    expect(palette.buttonText).toBe("#ffffff");
  });

  it("usa paleta escura no modo escuro", () => {
    const palette = getAuthPageColors(darkColors, true);
    expect(palette.pageBackground).toBe("#202024");
    expect(palette.cardBackground).toBe("#18191d");
    expect(palette.textMain).toBe("#ffffff");
    expect(palette.buttonBg).toBe("#e4e4e7");
    expect(palette.buttonText).toBe("#18181d");
  });
});
