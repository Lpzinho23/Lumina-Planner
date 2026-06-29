const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export type FileValidationResult = { valid: true } | { valid: false; message: string };

export function validateAvatarFile(file: File): FileValidationResult {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return {
      valid: false,
      message: "Formato inválido. Envie uma imagem PNG, JPG ou JPEG.",
    };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      message: "Arquivo muito grande. O limite é 2MB.",
    };
  }
  return { valid: true };
}
