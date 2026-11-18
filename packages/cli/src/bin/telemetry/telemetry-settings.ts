import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

/** Environment variable that disables CLI telemetry when set to `1` or `true`. */
export const TELEMETRY_OPTOUT_ENV = 'FUSION_CLI_TELEMETRY_OPTOUT';

/** Cross-tool convention (https://consoledonottrack.com) that disables telemetry when `1`. */
export const DO_NOT_TRACK_ENV = 'DO_NOT_TRACK';

/** Persisted, user-level telemetry preferences of the Fusion Framework CLI. */
export interface TelemetrySettings {
  /** Explicit user choice from `fusion-framework-cli telemetry enable|disable`. */
  enabled?: boolean;
  /** Set once the one-time collection notice has been shown. */
  noticeShown?: boolean;
}

/** Why telemetry is enabled or disabled for the current run. */
export type TelemetryStateReason = 'default' | 'config' | 'optout-env' | 'do-not-track';

/** Effective telemetry state for the current run. */
export interface TelemetryState {
  enabled: boolean;
  reason: TelemetryStateReason;
  /** Location of the persisted settings file. */
  configPath: string;
  settings: TelemetrySettings;
}

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

/**
 * Reads persisted telemetry settings. Missing or unreadable files yield empty settings, so a
 * corrupt file can never stop a command.
 *
 * @param path - Settings file location.
 * @returns The boolean preferences found in the file.
 */
export const readTelemetrySettings = (path: string): TelemetrySettings => {
  try {
    const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
    // Only known boolean preferences are honoured; anything else is ignored.
    if (!raw || typeof raw !== 'object') return {};
    const { enabled, noticeShown } = raw as Record<string, unknown>;
    return {
      ...(typeof enabled === 'boolean' ? { enabled } : {}),
      ...(typeof noticeShown === 'boolean' ? { noticeShown } : {}),
    };
  } catch {
    return {};
  }
};

/**
 * Merges and persists telemetry settings.
 *
 * @param path - Settings file location.
 * @param update - Preferences to change.
 * @returns The merged settings.
 * @throws When the file cannot be written; callers decide whether that matters.
 */
export const writeTelemetrySettings = (
  path: string,
  update: TelemetrySettings,
): TelemetrySettings => {
  const settings = { ...readTelemetrySettings(path), ...update };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(settings, null, 2)}\n`);
  return settings;
};

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
  if (optout === '1' || optout === 'true') {
    return { enabled: false, reason: 'optout-env', configPath, settings };
  }
  if (env[DO_NOT_TRACK_ENV]?.trim() === '1') {
    return { enabled: false, reason: 'do-not-track', configPath, settings };
  }
  if (settings.enabled !== undefined) {
    return { enabled: settings.enabled, reason: 'config', configPath, settings };
  }
  return { enabled: true, reason: 'default', configPath, settings };
};
