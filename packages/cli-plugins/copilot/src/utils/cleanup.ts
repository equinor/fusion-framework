import type { ChildProcess } from 'node:child_process';

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
