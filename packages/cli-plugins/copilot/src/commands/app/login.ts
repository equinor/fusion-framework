import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ab, resolveAppKey, cleanup, sleep, stripAnsi, waitForServer, pollConsole } from '../../utils/index.js';

/**
 * Interactive login mode for the `copilot app` command.
 *
 * Starts the application dev server, opens a headed browser window for
 * manual MSAL authentication, and polls the browser console for the Fusion
 * `"Done"` message that signals successful initialisation. The browser is
 * left open after login so the user can finish any manual steps before
 * pressing Ctrl+C.
 *
 * @param absAppPath - Absolute path to the Fusion application directory
 * @param port - Port number for the dev server
 * @param host - Host address for the dev server
 */
export async function runLogin(
  absAppPath: string,
  port: number,
  host: string,
): Promise<void> {
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

  let serverProcess: ChildProcess | undefined;

  console.log('📦 Resolving app manifest...');
  const appKey = resolveAppKey(absAppPath);
  console.log(`🚀 Starting server for ${appKey}...`);
  serverProcess = spawn(
    'ffc',
    ['app', 'dev', '--host', host, '--port', String(port)],
    { cwd: absAppPath, stdio: 'inherit', detached: false },
  );

  const serverUrl = `http://localhost:${port}`;
  const ready = await waitForServer(serverUrl, 60);
  if (!ready) {
    console.error('❌ Server failed to start within 60s');
    cleanup(serverProcess);
    process.exit(1);
  }

  const appUrl = `${serverUrl}/apps/${appKey}`;
  console.log(`✅ Server ready at ${appUrl}`);
  console.log('🌐 Opening headed browser — log in with your Equinor account...');

  ab(['open', appUrl, '--headed'], 60_000);

  // Ctrl+C handler: stop the dev server but leave the browser open
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping server... (browser left open)');
    cleanup(serverProcess);
    process.exit(0);
  });

  // Wait for the Fusion app to initialise (browser console emits "✓ Done" after auth)
  console.log('⏳ Waiting for app to initialize after login... (Ctrl+C to finish early)');
  const initialized = await pollConsole(
    (logs: string) => stripAnsi(logs).includes('Done'),
    300_000,
  );

  if (initialized) {
    await sleep(2000);
    console.log('✅ Login complete — session saved.');
  } else {
    console.log('⚠ Timed out waiting for app init. Session may still be saved.');
  }

  // Always wait for manual Ctrl+C so the user can finish what they're doing
  console.log('🌐 Browser still open. Press Ctrl+C to exit.');
  await new Promise(() => {}); // block until SIGINT
}
