import { execFileSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import { PROFILE_DIR } from './profile-dir.js';

/**
 * Runs an agent-browser command with the persistent Chrome profile.
 *
 * Calls the `agent-browser` binary resolved from `PATH` (homebrew or npm global).
 * Every invocation automatically injects `--profile <PROFILE_DIR>` so browser
 * state (cookies, session storage, MSAL tokens) persists across calls.
 *
 * @param args - Subcommand and arguments passed directly to `agent-browser`
 * @param timeoutMs - Maximum execution time in milliseconds (default: 30 000)
 * @returns Trimmed stdout from the command
 * @throws {Error} When `agent-browser` exits with a non-zero code or times out
 */
export function ab(args: string[], timeoutMs = 30_000): string {
  // Remove stale SingletonLock left by a previous Chrome crash to prevent
  // "Failed to create SingletonLock: File exists" errors.
  const lockPath = join(PROFILE_DIR, 'SingletonLock');
  // Only attempt removal when a stale lock file is actually present
  if (existsSync(lockPath)) {
    try {
      unlinkSync(lockPath);
    } catch {
      // Best-effort — if we can't remove it Chrome will fail with a clear message anyway.
    }
  }
  const fullArgs = ['--profile', PROFILE_DIR, ...args];
  return execFileSync('agent-browser', fullArgs, {
    encoding: 'utf-8',
    timeout: timeoutMs,
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd(),
  }).trim();
}

