/**
 * Validação das variáveis NEXT_PUBLIC_FIREBASE_* (build e runtime).
 * Acesso literal a process.env — necessário para o Next.js embutir no bundle.
 */
export const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebaseEnvKey = (typeof FIREBASE_ENV_KEYS)[number];
export type FirebaseEnvSnapshot = Record<FirebaseEnvKey, string>;

const PLACEHOLDER_API_KEY = "missing-api-key";
const CI_PLACEHOLDER = "ci-placeholder";

function sanitize(raw: string): string {
  let value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

/** Lê env com acesso estático (compatível com Turbopack/Webpack). */
export function readFirebaseEnvFromProcess(): FirebaseEnvSnapshot {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    ),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    ),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    ),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    ),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    ),
    NEXT_PUBLIC_FIREBASE_APP_ID: sanitize(
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    ),
  };
}

export function isCiFirebasePlaceholder(snapshot: FirebaseEnvSnapshot): boolean {
  return snapshot.NEXT_PUBLIC_FIREBASE_API_KEY === CI_PLACEHOLDER;
}

export function getMissingFirebaseEnvKeys(
  snapshot: FirebaseEnvSnapshot,
): FirebaseEnvKey[] {
  return FIREBASE_ENV_KEYS.filter((key) => !snapshot[key]);
}

/**
 * Retorna mensagem amigável se a config estiver inválida; null se OK.
 */
export function getFirebaseSetupIssue(
  snapshot: FirebaseEnvSnapshot,
): string | null {
  if (isCiFirebasePlaceholder(snapshot)) {
    return null;
  }

  const missing = getMissingFirebaseEnvKeys(snapshot);
  if (missing.length > 0) {
    return `Firebase não configurado: faltam ${missing.join(", ")}. Copie fin-app/.env.example para .env.local ou configure na Vercel e faça Redeploy.`;
  }

  const apiKey = snapshot.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey === PLACEHOLDER_API_KEY) {
    return "Firebase não configurado no build de produção. Atualize as variáveis na Vercel e faça Redeploy.";
  }

  if (!apiKey.startsWith("AIza") || apiKey.length < 35) {
    return "NEXT_PUBLIC_FIREBASE_API_KEY inválida. Use a apiKey do app Web (</>) no Console Firebase — começa com AIza.";
  }

  return null;
}
