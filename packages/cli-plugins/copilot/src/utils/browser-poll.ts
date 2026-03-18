import { ab } from './agent-browser.js';
import { sleep } from './process.js';

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
  while (Date.now() < deadline) {
    try {
      const logs = ab(['console']);
      if (predicate(logs)) return true;
    } catch {
      // Browser not ready — retry
    }
    await sleep(2000);
  }
  return false;
}
