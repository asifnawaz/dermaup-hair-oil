/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the surviving source symbol index and verified against all
 * compiled call sites in the latest deployed Worker.
 */

export function safeJsonParse<T>(
  value: string | null | undefined,
  fallback: T,
): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonParseUnknown(
  value: string | null | undefined,
): unknown | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
