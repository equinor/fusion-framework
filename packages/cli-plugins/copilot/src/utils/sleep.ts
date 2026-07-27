/**
 * Returns a promise that resolves after the given delay.
 *
 * @param ms - Delay in milliseconds
 * @returns A promise that resolves after `ms` milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
