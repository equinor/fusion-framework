/**
 * Normalizes an optional frontmatter list (YAML sequence or comma-separated string) to strings.
 *
 * @param value - Raw frontmatter value.
 * @returns Trimmed, non-empty string entries.
 */
export function toStringList(value: unknown): string[] {
  // fhelp accepts both YAML sequences and comma-separated strings for list fields.
  const entries = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return (
    entries
      // YAML may yield nested objects or nulls; only scalar values are meaningful list entries.
      .filter(
        (entry): entry is string | number => typeof entry === 'string' || typeof entry === 'number',
      )
      // Comma-separated strings carry surrounding whitespace that must not leak into keys or tags.
      .map((entry) => String(entry).trim())
      // Trailing commas and blank entries would otherwise become empty tags.
      .filter(Boolean)
  );
}

export default toStringList;
