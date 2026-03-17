import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { resolveAppKey, cleanup, waitForServer } from '../../utils/index.js';

/** Result of starting (or skipping) the app dev server. */
export interface AppServerResult {
  /** The child process running the dev server, if one was spawned. */
  serverProcess: ChildProcess | undefined;
  /** The fully-qualified app URL (e.g. `http://localhost:3000/apps/my-app`). */
  appUrl: string;
}

/**
 * Kills any process listening on the given port.
 *
 * Uses `lsof` to find PIDs bound to the port and sends SIGTERM.
 * Failures are silently ignored (port may already be free).
 *
 * @param port - The TCP port to free
 */
function freePort(port: number): void {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(parseInt(pid, 10), 'SIGTERM');
      } catch {
        // already dead
      }
    }
    if (pids.length) {
      console.log(`🔄 Killed stale process(es) on port ${port}: ${pids.join(', ')}`);
    }
  } catch {
    // lsof exits non-zero when no matches — port is free
  }
}

/**
 * Starts the Fusion app dev server for the given application path,
 * or returns the caller-provided URL when the server is already running.
 *
 * @param absAppPath - Absolute path to the Fusion application directory
 * @param options - Server configuration options
 * @param options.port - Port number for the dev server
 * @param options.host - Host address for the dev server
 * @param options.url - When provided, skips server startup and uses this URL directly
 * @param options.verbose - When true, inherits stdio from the spawned server process
 * @returns The spawned server process (if any) and the resolved app URL
 */
export async function startAppServer(
  absAppPath: string,
  options: { port: number; host: string; url?: string; verbose: boolean },
): Promise<AppServerResult> {
  // Caller already has a running server — skip startup entirely
  if (options.url) {
    return { serverProcess: undefined, appUrl: options.url };
  }

  const pkgJsonPath = join(absAppPath, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    console.error(`❌ No package.json found at ${absAppPath}`);
    process.exit(1);
  }
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as { name?: string };
  if (!pkgJson.name) {
    console.error(`❌ package.json at ${absAppPath} has no "name" field`);
    process.exit(1);
  }

  console.log('📦 Resolving app manifest...');
  const appKey = resolveAppKey(absAppPath);
  console.log(`🚀 Starting app server (${appKey})...`);

  // Kill stale dev servers on the target port from previous crashed runs
  freePort(options.port);

  const serverProcess = spawn(
    'ffc',
    ['app', 'serve', '--host', options.host, '--port', String(options.port)],
    {
      cwd: absAppPath,
      stdio: options.verbose ? 'inherit' : 'ignore',
      detached: false,
    },
  );

  const serverUrl = `http://localhost:${options.port}`;
  const ready = await waitForServer(serverUrl, 60);
  if (!ready) {
    console.error('❌ Server failed to start within 60s');
    cleanup(serverProcess);
    process.exit(1);
  }

  const appUrl = `${serverUrl}/apps/${appKey}`;
  console.log(`✅ Server ready at ${appUrl}`);

  return { serverProcess, appUrl };
}
