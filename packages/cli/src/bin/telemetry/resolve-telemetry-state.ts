import { readTelemetrySettings } from './read-telemetry-settings.js';
import { resolveTelemetryConfigPath } from './resolve-telemetry-config-path.js';
import { DO_NOT_TRACK_ENV, TELEMETRY_OPTOUT_ENV } from './static.js';
import type { TelemetryState } from './types.js';

/**
 * Resolves whether telemetry is enabled. Environment opt-outs win over the persisted choice,
 * so CI and policy can always disable collection; otherwise telemetry is on by default.
 *
 * @param env - Environment to read; defaults to `process.env`.
 * @param configPath - Settings file location; defaults to {@link resolveTelemetryConfigPath}.
 * @returns The effective state and the reason for it.
 */
export const resolveTelemetryState = (
  env: NodeJS.ProcessEnv = process.env,
  configPath: string = resolveTelemetryConfigPath(env),
): TelemetryState => {
  const settings = readTelemetrySettings(configPath);
  const optout = env[TELEMETRY_OPTOUT_ENV]?.trim().toLowerCase();
  // Deployment policy can disable collection regardless of the saved choice.
  if (optout === '1' || optout === 'true') {
    return { enabled: false, reason: 'optout-env', configPath, settings };
  }
  // Honor the user's cross-tool opt-out even without a Fusion-specific setting.
  if (env[DO_NOT_TRACK_ENV]?.trim() === '1') {
    return { enabled: false, reason: 'do-not-track', configPath, settings };
  }
  // Default collection only when the user has never made an explicit choice.
  if (settings.enabled !== undefined) {
    return { enabled: settings.enabled, reason: 'config', configPath, settings };
  }
  return { enabled: true, reason: 'default', configPath, settings };
};
