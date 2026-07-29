import { sleep } from './helpers.js';

/**
 * Polls a server URL until it responds with a non-5xx status or the
 * timeout is reached.
 *
 * @param url - The URL to poll (e.g. `http://localhost:3000`)
 * @param timeoutSeconds - Maximum number of seconds to wait
 * @returns `true` if the server responded before timeout, `false` otherwise
 */
export async function waitForServer(url: string, timeoutSeconds: number): Promise<boolean> {
  // Poll once per second up to the timeout, tolerating connection errors
  for (let i = 0; i < timeoutSeconds; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      // Treat any non-5xx response as evidence the server is up
      if (res.ok || res.status < 500) return true;
    } catch {
      // Server not ready yet — retry
    }
    await sleep(1000);
  }
  return false;
}
