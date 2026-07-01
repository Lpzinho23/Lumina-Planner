import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getMissingFirebaseEnvKeys,
  readFirebaseEnvFromProcess,
} from "@/lib/firebaseConfig";

const env = readFirebaseEnvFromProcess();

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
  return getMissingFirebaseEnvKeys(env);
}

const missing = getMissingFirebaseEnv();

if (process.env.NODE_ENV === "development" && missing.length > 0) {
  console.warn(
    `[firebase] Variáveis ausentes: ${missing.join(", ")}. Copie .env.example para .env.local.`,
  );
}

if (process.env.NODE_ENV === "production" && missing.length > 0) {
  console.error(
    `[firebase] Variáveis NEXT_PUBLIC_FIREBASE_* ausentes: ${missing.join(", ")}. Configure-as na Vercel para autenticação e dados reais.`,
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain:
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "missing.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project",
  storageBucket:
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "missing.appspot.com",
  messagingSenderId:
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:missing",
};

const app = getOrCreateFirebaseApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
