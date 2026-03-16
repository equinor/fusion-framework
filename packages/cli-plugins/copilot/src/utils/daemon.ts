import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

import { ab, PROFILE_DIR } from './agent-browser.js';

/** PID file written by the agent-browser daemon to track its own process. */
const DAEMON_PID_FILE = join(homedir(), '.agent-browser', 'default.pid');

/**
 * Kills any running agent-browser daemon and its Chrome children,
 * then removes stale state files so the next run starts clean.
 *
 * Cleanup sequence:
 * 1. Graceful `agent-browser close` (5 s timeout)
 * 2. Force-kill the daemon PID read from {@link DAEMON_PID_FILE}
 * 3. `pkill` leftover headless Chrome processes
 * 4. Delete Session Storage to clear stuck MSAL `interaction.status` flags
 */
export function resetDaemon(): void {
  // 1. Try graceful close first
  try {
    execFileSync('agent-browser', ['close'], {
      encoding: 'utf-8',
      timeout: 5_000,
      stdio: 'ignore',
    });
    console.log('🔄 Closed agent-browser daemon');
  } catch {
    // Daemon not responding — fall through to force-kill
  }

  // 2. Kill the daemon process tracked by agent-browser's own pid file
  if (existsSync(DAEMON_PID_FILE)) {
    try {
      const pid = parseInt(readFileSync(DAEMON_PID_FILE, 'utf-8').trim(), 10);
      if (pid > 0) process.kill(pid);
      console.log('🔄 Killed agent-browser daemon (pid %d)', pid);
    } catch {
      // Process already dead — acceptable
    }
    rmSync(DAEMON_PID_FILE, { force: true });
  }

  // 3. Force-kill any leftover headless Chrome processes
  try {
    execSync("pkill -f 'Google Chrome for Testing.*--headless'", {
      stdio: 'ignore',
      timeout: 3_000,
    });
  } catch {
    // No matching processes — acceptable
  }

  // 4. Clear Session Storage to remove stuck MSAL interaction.status flags
  const sessionStorage = join(PROFILE_DIR, 'Default', 'Session Storage');
  if (existsSync(sessionStorage)) {
    rmSync(sessionStorage, { recursive: true, force: true });
    console.log('🔄 Cleared Session Storage (MSAL interaction flags)');
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
