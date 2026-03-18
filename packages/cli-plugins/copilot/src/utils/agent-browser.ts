import { execFileSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Persistent Chrome profile directory used across agent-browser sessions. */
export const PROFILE_DIR = `${homedir()}/.fusion-smoke-profile`;

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

/**
 * Extracts the user-facing error message from an agent-browser failure.
 *
 * Strips ANSI escape codes from stderr and returns only the diagnostic
 * lines prefixed with `✗` or `⚠`. Falls back to the first 200 characters
 * of the error message when no diagnostic lines are found.
 *
 * @param err - The caught error (typically from {@link ab})
 * @returns A single-line summary suitable for console output
 */
export function abErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const e = err as Error & { stderr?: string };
  if (e.stderr) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI escape sequences
    const ansiPattern = /\x1B\[[0-9;]*m/g;
    const lines = e.stderr
      .replace(ansiPattern, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('✗') || l.startsWith('⚠'));
    if (lines.length) return lines.join(' | ');
  }
  const match = e.message.match(/[✗⚠].+/);
  return match ? match[0] : e.message.slice(0, 200);
}
