import type { DashboardGridLayoutItem } from "@/types/finance";
import { VALIDATION_MESSAGES } from "./validationMessages";

type LayoutValidationResult =
  | { ok: true; value: DashboardGridLayoutItem[] }
  | { ok: false; message: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidItem(value: unknown): value is DashboardGridLayoutItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.i === "string" &&
    candidate.i.trim().length > 0 &&
    isFiniteNumber(candidate.x) &&
    isFiniteNumber(candidate.y) &&
    isFiniteNumber(candidate.w) &&
    isFiniteNumber(candidate.h) &&
    candidate.w > 0 &&
    candidate.h > 0
  );
}

export function sanitizeDashboardLayout(input: unknown): LayoutValidationResult {
  if (!Array.isArray(input)) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidDashboardLayout };
  }
  const sanitized = input.filter(isValidItem).map((item) => ({
    i: item.i.trim(),
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));
  if (sanitized.length === 0) {
    return { ok: false, message: VALIDATION_MESSAGES.invalidDashboardLayout };
  }
  return { ok: true, value: sanitized };
}
