import { execFileSync } from 'node:child_process';

/**
 * Resolves the Fusion `appKey` by running `ffc app manifest --silent`
 * in the given application directory and parsing the JSON output.
 *
 * @param appDir - Absolute path to the Fusion application
 * @returns The `appKey` string from the manifest
 * @throws {Error} When `ffc app manifest` fails or returns invalid JSON
 */
export function resolveAppKey(appDir: string): string {
  const output = execFileSync('ffc', ['app', 'manifest', '--silent'], {
    cwd: appDir,
    encoding: 'utf-8',
    timeout: 30_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const manifest = JSON.parse(output) as { appKey: string };
  return manifest.appKey;
}
