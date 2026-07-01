import { describe, expect, it } from "vitest";
import {
  getFirebaseSetupIssue,
  isCiFirebasePlaceholder,
  type FirebaseEnvSnapshot,
} from "./firebaseConfig";

const validSnapshot: FirebaseEnvSnapshot = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyB12345678901234567890123456789012",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "dashboard-financeiro.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "dashboard-financeiro",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "dashboard-financeiro.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789012",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789012:web:abcdef123456",
};

describe("firebaseConfig", () => {
  it("aceita snapshot válido", () => {
    expect(getFirebaseSetupIssue(validSnapshot)).toBeNull();
  });

  it("detecta variáveis ausentes", () => {
    const issue = getFirebaseSetupIssue({
      ...validSnapshot,
      NEXT_PUBLIC_FIREBASE_API_KEY: "",
    });
    expect(issue).toContain("NEXT_PUBLIC_FIREBASE_API_KEY");
  });

  it("detecta api key placeholder do build", () => {
    const issue = getFirebaseSetupIssue({
      ...validSnapshot,
      NEXT_PUBLIC_FIREBASE_API_KEY: "missing-api-key",
    });
    expect(issue).toContain("Redeploy");
  });

  it("detecta api key com formato inválido", () => {
    const issue = getFirebaseSetupIssue({
      ...validSnapshot,
      NEXT_PUBLIC_FIREBASE_API_KEY: "chave-errada",
    });
    expect(issue).toContain("AIza");
  });

  it("ignora placeholder do CI", () => {
    const ciSnapshot: FirebaseEnvSnapshot = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "ci-placeholder",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "ci-placeholder",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "ci-placeholder",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "ci-placeholder",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "ci-placeholder",
      NEXT_PUBLIC_FIREBASE_APP_ID: "ci-placeholder",
    };
    expect(isCiFirebasePlaceholder(ciSnapshot)).toBe(true);
    expect(getFirebaseSetupIssue(ciSnapshot)).toBeNull();
  });
});
