import { VALIDATION_MESSAGES } from "./validationMessages";

type DisplayNameValidation =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function sanitizeDisplayName(input: string): DisplayNameValidation {
  const value = input.trim().slice(0, 60);
  if (!value) {
    return { ok: false, message: VALIDATION_MESSAGES.requiredDisplayName };
  }
  return { ok: true, value };
}
