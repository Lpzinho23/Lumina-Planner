import { describe, expect, it } from "vitest";
import {
  detectInstallPlatform,
  getInstallInstructions,
  isStandaloneDisplayMode,
} from "./pwa";

describe("detectInstallPlatform", () => {
  it("detecta iPhone", () => {
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe("ios");
  });

  it("detecta Android", () => {
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
      ),
    ).toBe("android");
  });

  it("detecta desktop", () => {
    expect(
      detectInstallPlatform(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
      ),
    ).toBe("desktop");
  });
});

describe("getInstallInstructions", () => {
  it("retorna passos para iOS", () => {
    const steps = getInstallInstructions("ios");
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0]).toMatch(/Safari/i);
  });

  it("retorna passos para Android", () => {
    const steps = getInstallInstructions("android");
    expect(steps.some((s) => /instalar|tela inicial/i.test(s))).toBe(true);
  });

  it("retorna passos para desktop", () => {
    const steps = getInstallInstructions("desktop");
    expect(steps.some((s) => /Chrome|Edge|instalar/i.test(s))).toBe(true);
  });
});

describe("isStandaloneDisplayMode", () => {
  it("retorna false sem window", () => {
    expect(isStandaloneDisplayMode(undefined)).toBe(false);
  });

  it("retorna true quando display-mode é standalone", () => {
    const matchMedia = (query: string) => ({
      matches: query.includes("standalone"),
      media: query,
    });
    expect(
      isStandaloneDisplayMode({
        matchMedia,
        navigator: {},
      }),
    ).toBe(true);
  });

  it("retorna true no modo standalone do Safari iOS", () => {
    expect(
      isStandaloneDisplayMode({
        matchMedia: () => ({ matches: false, media: "" }),
        navigator: { standalone: true },
      }),
    ).toBe(true);
  });
});
