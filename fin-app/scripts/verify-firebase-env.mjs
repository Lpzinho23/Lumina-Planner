/**
 * Falha o build na Vercel se as variáveis Firebase estiverem ausentes ou inválidas.
 * O CI usa valores ci-placeholder e continua passando.
 */
const CI_PLACEHOLDER = "ci-placeholder";
const PLACEHOLDER_API_KEY = "missing-api-key";

const KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function sanitize(raw) {
  let value = String(raw ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function readSnapshot() {
  return Object.fromEntries(KEYS.map((key) => [key, sanitize(process.env[key])]));
}

function isCiPlaceholder(snapshot) {
  return snapshot.NEXT_PUBLIC_FIREBASE_API_KEY === CI_PLACEHOLDER;
}

function validate(snapshot) {
  if (isCiPlaceholder(snapshot)) {
    console.log("[firebase] CI placeholder detectado — verificação ignorada.");
    return;
  }

  const missing = KEYS.filter((key) => !snapshot[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variáveis Firebase ausentes: ${missing.join(", ")}. Configure na Vercel (Settings → Environment Variables) e faça Redeploy.`,
    );
  }

  const apiKey = snapshot.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey === PLACEHOLDER_API_KEY) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_API_KEY não foi injetada no build. Configure na Vercel e faça Redeploy.",
    );
  }

  if (!apiKey.startsWith("AIza") || apiKey.length < 35) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_API_KEY inválida. Copie a apiKey do app Web (</>) no Firebase Console.",
    );
  }

  console.log(
    `[firebase] OK — projectId=${snapshot.NEXT_PUBLIC_FIREBASE_PROJECT_ID}, apiKey=${apiKey.slice(0, 6)}…${apiKey.slice(-4)}`,
  );
}

const isVercel = Boolean(process.env.VERCEL);
const isCi = process.env.CI === "true";

if (!isVercel && !isCi) {
  const snapshot = readSnapshot();
  const issue =
    getMissingIssue(snapshot) ?? getApiKeyIssue(snapshot);
  if (issue) {
    console.warn(`[firebase] Aviso (build local): ${issue}`);
  } else {
    console.log("[firebase] Variáveis locais parecem válidas.");
  }
  process.exit(0);
}

function getMissingIssue(snapshot) {
  const missing = KEYS.filter((key) => !snapshot[key]);
  return missing.length > 0
    ? `Variáveis ausentes: ${missing.join(", ")}`
    : null;
}

function getApiKeyIssue(snapshot) {
  const apiKey = snapshot.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey === PLACEHOLDER_API_KEY) {
    return "API key placeholder no build";
  }
  if (!apiKey.startsWith("AIza") || apiKey.length < 35) {
    return "API key com formato inválido";
  }
  return null;
}

try {
  validate(readSnapshot());
} catch (error) {
  console.error(
    `\n[firebase] Build bloqueado: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
