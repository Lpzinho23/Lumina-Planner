import { extractErrorCode } from "./errorHandling";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/user-not-found": "Este e-mail não está cadastrado.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed":
    "Falha de conexão. Verifique sua internet e tente novamente.",
  "auth/requires-recent-login":
    "Confirme sua senha atual para concluir esta ação.",
  "auth/weak-password": "A senha informada é muito fraca.",
  "auth/invalid-api-key":
    "Chave do Firebase inválida. Confira NEXT_PUBLIC_FIREBASE_API_KEY na Vercel e faça Redeploy.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Chave do Firebase inválida. Confira NEXT_PUBLIC_FIREBASE_API_KEY na Vercel e faça Redeploy.",
  "auth/operation-not-allowed":
    "Cadastro por e-mail desativado no Firebase. Ative E-mail/senha em Authentication → Sign-in method.",
  "auth/unauthorized-domain":
    "Domínio não autorizado. Adicione seu domínio Vercel em Firebase → Authentication → Settings → Authorized domains.",
};

export function extractAuthErrorCode(error: unknown): string | undefined {
  return extractErrorCode(error);
}

export function getAuthFriendlyMessage(code: string | undefined): string {
  if (!code) {
    return "Não foi possível concluir a operação. Tente novamente.";
  }
  return (
    AUTH_ERROR_MESSAGES[code] ??
    "Não foi possível concluir a operação. Tente novamente."
  );
}
