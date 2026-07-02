/**
 * Formats a numeric string or number into thousands separated string (ID format: e.g. 15.000.000).
 */
export function formatThousands(val: string | number): string {
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("id-ID");
}

/**
 * Parses a thousands-separated string back to a raw number by stripping non-digit characters.
 */
export function parseThousands(val: string): number {
  const clean = val.replace(/\D/g, "");
  return parseFloat(clean) || 0;
}
