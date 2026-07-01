/**
 * Diagnóstico das variáveis Firebase no build.
 * Não bloqueia o deploy — apenas registra avisos (o alerta aparece em /login e /cadastro).
 * O CI usa ci-placeholder e ignora a verificação.
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

function collectIssues(snapshot) {
  if (isCiPlaceholder(snapshot)) {
    return [];
  }

  const issues = [];
  const missing = KEYS.filter((key) => !snapshot[key]);
  if (missing.length > 0) {
    issues.push(
      `Variáveis ausentes: ${missing.join(", ")}. Configure em Vercel → Settings → Environment Variables.`,
    );
  }

  const apiKey = snapshot.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey === PLACEHOLDER_API_KEY) {
    issues.push(
      "NEXT_PUBLIC_FIREBASE_API_KEY não entrou no build. Confira a Vercel e faça Redeploy.",
    );
  } else if (apiKey && (!apiKey.startsWith("AIza") || apiKey.length < 35)) {
    issues.push(
      "NEXT_PUBLIC_FIREBASE_API_KEY com formato inválido. Copie a apiKey do app Web (</>) no Firebase.",
    );
  }

  return issues;
}

const snapshot = readSnapshot();
const issues = collectIssues(snapshot);

if (issues.length === 0) {
  const apiKey = snapshot.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey && !isCiPlaceholder(snapshot)) {
    console.log(
      `[firebase] OK — projectId=${snapshot.NEXT_PUBLIC_FIREBASE_PROJECT_ID}, apiKey=${apiKey.slice(0, 6)}…${apiKey.slice(-4)}`,
    );
  } else {
    console.log("[firebase] CI placeholder detectado — verificação ignorada.");
  }
} else {
  console.warn("\n[firebase] Avisos de configuração (o build continua):");
  for (const issue of issues) {
    console.warn(`  • ${issue}`);
  }
  console.warn(
    "  → Após corrigir na Vercel, faça Redeploy para o cadastro/login funcionar.\n",
  );
}

process.exit(0);
