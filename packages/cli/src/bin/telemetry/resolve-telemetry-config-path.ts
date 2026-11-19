import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Resolves the user-level settings file, following the platform's configuration directory:
 * `%APPDATA%` on Windows, otherwise `$XDG_CONFIG_HOME` or `~/.config`.
 *
 * @param env - Environment to read; defaults to `process.env`.
 * @param platform - Platform to resolve for; defaults to `process.platform`.
 * @returns Absolute path of `fusion-framework-cli/telemetry.json`.
 */
export const resolveTelemetryConfigPath = (
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
): string => {
  const base =
    platform === 'win32'
      ? (env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))
      : (env.XDG_CONFIG_HOME ?? join(homedir(), '.config'));
  return join(base, 'fusion-framework-cli', 'telemetry.json');
};
