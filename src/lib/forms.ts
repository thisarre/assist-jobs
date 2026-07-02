/**
 * Convert an empty/whitespace-only string to null so optional DB columns
 * store NULL rather than "". Passes through non-empty strings untouched.
 */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
