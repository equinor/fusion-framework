import type { ChildProcess } from 'node:child_process';

/**
 * Sends `SIGTERM` to a child process if it is still running.
 *
 * @param proc - The child process to terminate (no-op when `undefined` or already killed)
 */
export function cleanup(proc?: ChildProcess): void {
  if (proc && !proc.killed) {
    proc.kill('SIGTERM');
  }
}

/**
 * Returns a promise that resolves after the given delay.
 *
 * @param ms - Delay in milliseconds
 * @returns A promise that resolves after `ms` milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Strips ANSI escape codes (color / formatting) from a string.
 *
 * @param s - The string potentially containing ANSI sequences
 * @returns The input string with all ANSI escape sequences removed
 */
export function stripAnsi(s: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI escape sequences
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
