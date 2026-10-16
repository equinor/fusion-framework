/**
 * Compares strings by UTF-16 code units so ordering never depends on the host locale.
 *
 * @param a - First string.
 * @param b - Second string.
 * @returns A negative number, zero or a positive number, as required by `Array.prototype.sort`.
 */
export function compareCodeUnits(a: string, b: string): number {
  // Relational string operators compare code units, unlike localeCompare
  if (a < b) return -1;
  // Equal strings fall through to zero
  if (a > b) return 1;
  return 0;
}
