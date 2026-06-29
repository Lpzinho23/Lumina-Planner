import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Acesso estático obrigatório: Turbopack/Webpack só substitui NEXT_PUBLIC_*
 * quando a propriedade é acessada de forma literal (análise estática).
 * Acesso dinâmico via process.env[variavel] resulta em undefined no bundle.
 */
const RAW_ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

type FirebaseEnvKey = keyof typeof RAW_ENV;

const FIREBASE_ENV_KEYS = Object.keys(RAW_ENV) as FirebaseEnvKey[];

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

function readEnv(key: FirebaseEnvKey): string {
  return sanitize(RAW_ENV[key]);
}

function fingerprintConfig(config: FirebaseOptions): string {
  return JSON.stringify({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
}

/** Hash curto e estável (apenas para nomear o app no cliente; não é segurança). */
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/**
 * No Next.js (HMR), o módulo pode ser reavaliado com nova env, mas o Firebase já
 * manteve um app `[DEFAULT]` inicializado com apiKey antiga — getApp() reutiliza
 * e o Auth continua com auth/invalid-api-key. Um app nomeado por fingerprint
 * força novo initializeApp quando a config mudar.
 */
function getOrCreateFirebaseApp(config: FirebaseOptions): FirebaseApp {
  const suffix = shortHash(fingerprintConfig(config));
  const rawName = `finapp_${suffix}`;
  const appName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  const existing = getApps().find((a) => a.name === appName);
  if (existing) return existing;
  return initializeApp(config, appName);
}

export function getMissingFirebaseEnv(): string[] {
  return FIREBASE_ENV_KEYS.filter((k) => !readEnv(k));
}

const missing = getMissingFirebaseEnv();

if (process.env.NODE_ENV === "development" && missing.length > 0) {
  console.warn(
    `[firebase] Variáveis ausentes: ${missing.join(", ")}. Copie .env.example para .env.local.`,
  );
}

if (process.env.NODE_ENV === "production" && missing.length > 0) {
  throw new Error(
    `[firebase] Variáveis NEXT_PUBLIC_FIREBASE_* ausentes: ${missing.join(", ")}`,
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

const app = getOrCreateFirebaseApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
