import { compareCodeUnits } from './compare-code-units.js';

/**
 * Finds entries in one directory whose route names differ only by letter case.
 *
 * Such names map to the same case-insensitive URL and behave differently across
 * file systems, so they are rejected rather than resolved by platform behaviour.
 *
 * @param names - Route-relevant names (file stems or directory names) in one directory.
 * @returns Groups of conflicting names, each sorted, in code-unit order.
 */
export function findCaseCollisions(names: readonly string[]): string[][] {
  const byKey = new Map<string, Set<string>>();
  // Group names by their case-insensitive key
  for (const name of names) {
    const key = name.toLowerCase();
    const group = byKey.get(key) ?? new Set<string>();
    group.add(name);
    byKey.set(key, group);
  }
  return (
    [...byKey.values()]
      // Keep only keys shared by several spellings
      .filter((group) => group.size > 1)
      // Sort each group so diagnostics are deterministic
      .map((group) => [...group].sort(compareCodeUnits))
      .sort((a, b) => compareCodeUnits(a[0], b[0]))
  );
}
