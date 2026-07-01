import { describe, expect, it } from "vitest";
import { buildSecurityHeaders, buildCspValue } from "./securityHeaders";

describe("securityHeaders", () => {
  it("gera CSP com diretivas essenciais em dev", () => {
    const csp = buildCspValue("development");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("'unsafe-eval'");
  });

  it("remove unsafe-eval em produção", () => {
    const csp = buildCspValue("production");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("expõe headers críticos de segurança", () => {
    const names = buildSecurityHeaders("production").map((h) => h.key);
    expect(names).toContain("Content-Security-Policy");
    expect(names).toContain("X-Content-Type-Options");
    expect(names).toContain("Referrer-Policy");
    expect(names).toContain("Permissions-Policy");
    expect(names).toContain("Strict-Transport-Security");
    expect(names).toContain("Cross-Origin-Opener-Policy");
    expect(names).toContain("Cross-Origin-Resource-Policy");
  });

  it("usa connect-src restrito sem curingas amplos", () => {
    const csp = buildCspValue("production");
    expect(csp).toContain("https://identitytoolkit.googleapis.com");
    expect(csp).toContain("https://securetoken.googleapis.com");
    expect(csp).toContain("https://firestore.googleapis.com");
    expect(csp).toContain("https://firebasestorage.googleapis.com");
    expect(csp).not.toContain("https://*.googleapis.com");
    expect(csp).not.toContain("https://*.firebaseio.com");
  });

  it("permite service worker e manifest no CSP", () => {
    const csp = buildCspValue("production");
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
  });
});
