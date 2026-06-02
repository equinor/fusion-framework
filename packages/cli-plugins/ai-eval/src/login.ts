import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { createCommand } from 'commander';

import { ab, PROFILE_DIR } from './utils/agent-browser.js';

/** PID file written by agent-browser to track its daemon process. */
const DAEMON_PID_FILE = join(homedir(), '.agent-browser', 'default.pid');

/**
 * Kills any running agent-browser daemon and stale Chrome processes so
 * the upcoming headed launch starts with a clean slate.
 */
function resetDaemon(): void {
  try {
    execFileSync('agent-browser', ['close'], { timeout: 5_000, stdio: 'ignore' });
  } catch {
    // Daemon not running — that's fine.
  }

  if (existsSync(DAEMON_PID_FILE)) {
    try {
      const pid = parseInt(readFileSync(DAEMON_PID_FILE, 'utf-8').trim(), 10);
      if (pid > 0) process.kill(pid);
    } catch {
      // PID already gone.
    }
    try {
      rmSync(DAEMON_PID_FILE);
    } catch {
      // Best-effort cleanup.
    }
  }

  try {
    execFileSync('pkill', ['-f', 'Google Chrome.*fusion-smoke-profile'], { stdio: 'ignore' });
  } catch {
    // No matching processes — fine.
  }
}

/**
 * `ffc ai browser login` — seed the browser session for ffc ai eval.
 *
 * Opens a headed Chrome window at `--url` using the shared
 * `~/.fusion-smoke-profile`. The user completes the interactive MSAL login,
 * and the resulting session cookies and tokens persist in the profile so
 * subsequent `ffc ai eval` runs can browse the app without re-authenticating.
 *
 * ```bash
 * ffc ai browser login --url http://localhost:3333/apps/my-app
 * ```
 *
 * Press Ctrl+C to close after login is complete.
 */
const _loginCommand = createCommand('login')
  .description(
    'Seed the browser session for ffc ai eval.\n\n' +
      'Opens a headed Chrome window at --url using the shared profile ' +
      `(${PROFILE_DIR}). Log in with your Equinor account, then press Ctrl+C.`,
  )
  .requiredOption('--url <url>', 'URL of the running application to authenticate against')
  .action(async (options: { url: string }) => {
    const { url } = options;

    console.log(`\n🔐 Opening headed browser at ${url}`);
    console.log(`   Profile: ${PROFILE_DIR}`);
    console.log('   Log in with your Equinor account, then press Ctrl+C.\n');

    resetDaemon();

    // Launch headed Chrome with the shared profile. The --profile flag is passed
    // here explicitly because this is the one call that starts the daemon with
    // the correct profile directory. Subsequent eval calls route through the
    // already-running daemon and must NOT pass --profile again.
    try {
      ab(['--profile', PROFILE_DIR, 'open', url, '--headed'], 30 * 60 * 1_000); // 30 min timeout
    } catch {
      // User pressed Ctrl+C or browser closed — expected exit path.
    }

    console.log('\n✅ Session saved to profile. You can now run ffc ai eval.');
    process.exit(0);
  });

/**
 * `ffc ai browser` — browser session management commands for ffc ai eval.
 */
export const browserCommand = createCommand('browser')
  .description('Manage the browser session used by ffc ai eval')
  .addCommand(_loginCommand);
