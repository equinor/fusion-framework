import { DO_NOT_TRACK_ENV } from './do-not-track-env.js';
import { TELEMETRY_OPTOUT_ENV } from './telemetry-optout-env.js';
import { readTelemetrySettings } from './read-telemetry-settings.js';
import { resolveTelemetryConfigPath } from './resolve-telemetry-config-path.js';
import type { TelemetryState } from './telemetry-settings-types.js';

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
  // Explicit Fusion opt-out takes precedence over every stored preference.
  if (optout === '1' || optout === 'true') {
    return { enabled: false, reason: 'optout-env', configPath, settings };
  }
  // Honor the cross-tool convention after the CLI-specific opt-out.
  if (env[DO_NOT_TRACK_ENV]?.trim() === '1') {
    return { enabled: false, reason: 'do-not-track', configPath, settings };
  }
  // A saved choice applies only when neither environment override disables telemetry.
  if (settings.enabled !== undefined) {
    return { enabled: settings.enabled, reason: 'config', configPath, settings };
  }
  return { enabled: true, reason: 'default', configPath, settings };
};
