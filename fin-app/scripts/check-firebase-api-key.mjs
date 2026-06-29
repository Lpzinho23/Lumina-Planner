/**
 * Diagnóstico local: valida se a API key do Firebase é aceita pelo Identity Toolkit,
 * sem imprimir a chave completa no console.
 *
 * Uso: node scripts/check-firebase-api-key.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error("Arquivo .env.local não encontrado em", filePath);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    val = val.replace(/^\uFEFF/, "");
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1).trim();
    }
    out[key] = val;
  }
  return out;
}

const env = loadDotEnv(envPath);
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const appId = env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "";

if (!apiKey) {
  console.error("NEXT_PUBLIC_FIREBASE_API_KEY está vazia no .env.local.");
  process.exit(1);
}

const preview = `${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (length=${apiKey.length})`;
console.log("API key (mascarada):", preview);
console.log("projectId:", projectId || "(vazio)");
console.log("appId:", appId ? `${appId.slice(0, 12)}…` : "(vazio)");

if (!apiKey.startsWith("AIza") || apiKey.length < 35) {
  console.warn(
    "Aviso: formato incomum para chave Web do Firebase. Confira se copiou a apiKey do app Web no Console Firebase.",
  );
}

const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`;
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    returnSecureToken: true,
    email: `diag_${Date.now()}@example.invalid`,
    password: "DiagPass9!",
  }),
});

const bodyText = await res.text();
let message = bodyText.slice(0, 500);
try {
  const j = JSON.parse(bodyText);
  if (j?.error?.message) message = j.error.message;
} catch {
  // manter texto bruto
}

console.log("HTTP", res.status);
console.log("Resposta (trecho):", message);

if (res.status === 400 && String(message).includes("INVALID_API_KEY")) {
  console.error(
    "\nConclusão: o Google rejeitou a API key (INVALID_API_KEY). Geralmente é chave errada, revogada ou restrição no Google Cloud (credenciais).\n",
  );
  process.exit(2);
}

if (res.status === 403) {
  console.error(
    "\nConclusão: HTTP 403 — verifique restrições da API key no Google Cloud Console (referrer / IP / apps Android+iOS).\n",
  );
  process.exit(3);
}

console.log(
  "\nA API key foi aceita pelo endpoint de teste. Se o app ainda falhar, reinicie o servidor (Ctrl+C → npm run dev) para limpar cache do app Firebase no HMR.\n",
);
