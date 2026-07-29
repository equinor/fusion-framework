import { ab } from './ab.js';
import { sleep } from './helpers.js';

/**
 * Polls the browser's console log output until a predicate returns `true`
 * or the timeout expires.
 *
 * @param predicate - Callback receiving the raw console log text; return `true` to stop
 * @param timeoutMs - Maximum polling duration in milliseconds
 * @returns `true` if the predicate matched before timeout, `false` otherwise
 */
export async function pollConsole(
  predicate: (logs: string) => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  // Keep polling console output until the predicate matches or time runs out
  while (Date.now() < deadline) {
    try {
      const logs = ab(['console']);
      // Stop polling as soon as the caller's condition is satisfied
      if (predicate(logs)) return true;
    } catch {
      // Browser not ready — retry
    }
    await sleep(2000);
  }
  return false;
}
