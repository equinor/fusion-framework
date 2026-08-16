/**
 * Derives a numeric seed from a string, for a deterministic {@link https://fakerjs.dev/ | faker} instance.
 *
 * @remarks
 * A pure-JS hash (no `node:crypto`) so fixtures stay usable in browser-like test
 * environments, not just Node. Same id in, same seed out, every run.
 *
 * @param value - The string to derive a seed from (typically a generated item id).
 * @returns A 32-bit unsigned integer seed.
 */
export const stringToSeed = (value: string): number =>
  // FNV-1a-style hash: fold each char in, keep the running hash unsigned 32-bit
  [...value].reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );

export default stringToSeed;
