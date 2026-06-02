import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

/**
 * Persistent Chrome profile directory shared across agent-browser sessions.
 *
 * MSAL auth cookies and session storage tokens persist here across runs so the
 * developer only needs to run an interactive login once (via `--login` flag)
 * and subsequent `ffc ai eval` invocations reuse the cached session.
 */
export const PROFILE_DIR = `${homedir()}/.fusion-smoke-profile`;

/**
 * Runs an agent-browser command with the persistent Chrome profile.
 *
 * Every invocation automatically injects `--profile <PROFILE_DIR>` so browser
 * state (cookies, session storage, MSAL tokens) persists across calls.
 * Removes a stale `SingletonLock` file before each call to avoid Chrome
 * "Failed to create SingletonLock" crashes caused by unclean previous exits.
 *
 * @param args - Subcommand and arguments passed directly to `agent-browser`.
 * @param timeoutMs - Maximum execution time in milliseconds (default 30 000).
 * @returns Trimmed stdout from the command.
 * @throws {Error} When `agent-browser` exits with a non-zero code or times out.
 */
export function ab(args: string[], timeoutMs = 30_000): string {
  return execFileSync('agent-browser', args, {
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
 * @param err - The caught error (typically thrown by {@link ab}).
 * @returns A single-line summary suitable for console output.
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
    if (lines.length) return lines.join(' ');
  }
  return e.message.slice(0, 200);
}
