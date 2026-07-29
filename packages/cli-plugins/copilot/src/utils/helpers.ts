import { homedir } from 'node:os';
import type { ChildProcess } from 'node:child_process';
import { ab } from './ab.js';

/** Persistent Chrome profile directory used across agent-browser sessions. */
export const PROFILE_DIR = `${homedir()}/.fusion-smoke-profile`;

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

/**
 * Sends `SIGTERM` to a child process if it is still running.
 *
 * @param proc - The child process to terminate (no-op when `undefined` or already killed)
 */
export function cleanup(proc?: ChildProcess): void {
  // Only signal processes that are still alive; nothing to do otherwise
  if (proc && !proc.killed) {
    proc.kill('SIGTERM');
  }
}

/**
 * Clears the MSAL `interaction.status` flag from `sessionStorage` in the
 * running browser via `agent-browser eval`.
 */
export function clearMsalInteraction(): void {
  try {
    ab(['eval', 'sessionStorage.removeItem("msal.interaction.status")'], 5_000);
  } catch {
    // Browser may not be ready yet — non-fatal
  }
}
