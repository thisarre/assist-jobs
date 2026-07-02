/**
 * Convert an empty/whitespace-only string to null so optional DB columns
 * store NULL rather than "". Passes through non-empty strings untouched.
 */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Parse an <input type="date"> value ("yyyy-mm-dd" or "") into a Date or null.
 * Interprets the date as UTC midnight to avoid timezone drift.
 */
export function parseDateInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return new Date(`${trimmed}T00:00:00.000Z`);
}

/** Format a Date (or null) as a "yyyy-mm-dd" string for <input type="date">. */
export function toDateInputValue(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}
