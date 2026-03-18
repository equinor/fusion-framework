import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { sleep } from './process.js';

/**
 * Creates a timestamped, run-specific output directory for eval artifacts.
 *
 * @param title - Human label used as the directory name prefix (slugified)
 * @param baseDir - Optional parent directory override
 * @returns Absolute path to the newly created directory
 */
export function createRunDir(title: string, baseDir?: string): string {
  const now = new Date();
  const date = [now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('');
  const time = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join('');
  const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
  const slug = title.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
  const parent = baseDir ? resolve(baseDir) : resolve('.tmp', 'copilot');
  const id = randomUUID().slice(0, 8);
  const dir = join(parent, `${slug}_${date}${time}${ms}_${id}`);
  mkdirSync(dir, { recursive: true });
  console.log(`📁 Run dir: ${relative(process.cwd(), dir)}`);
  return dir;
}

/**
 * Resolves the Fusion `appKey` by running `ffc app manifest --silent`
 * in the given application directory and parsing the JSON output.
 *
 * @param appDir - Absolute path to the Fusion application
 * @returns The `appKey` string from the manifest
 * @throws {Error} When `ffc app manifest` fails or returns invalid JSON
 */
export function resolveAppKey(appDir: string): string {
  const output = execFileSync('ffc', ['app', 'manifest', '--silent'], {
    cwd: appDir,
    encoding: 'utf-8',
    timeout: 30_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const manifest = JSON.parse(output) as { appKey: string };
  return manifest.appKey;
}

/**
 * Polls a server URL until it responds with a non-5xx status or the
 * timeout is reached.
 *
 * @param url - The URL to poll (e.g. `http://localhost:3000`)
 * @param timeoutSeconds - Maximum number of seconds to wait
 * @returns `true` if the server responded before timeout, `false` otherwise
 */
export async function waitForServer(url: string, timeoutSeconds: number): Promise<boolean> {
  for (let i = 0; i < timeoutSeconds; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1_500);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok || res.status < 500) return true;
    } catch {
      // Server not ready yet or request timed out — retry
    } finally {
      clearTimeout(timeoutId);
    }
    await sleep(1000);
  }
  return false;
}
