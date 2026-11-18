import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
  /**
   * Whether the one-time collection notice has been shown. Kept in its own marker file (see
   * {@link markTelemetryNoticeShown}) so recording the notice never rewrites the user's choice.
   */
  noticeShown?: boolean;
}

/** Name of the marker file, next to the settings file, that records the notice was shown. */
const NOTICE_MARKER_FILE = 'telemetry-notice-shown';

const resolveNoticeMarkerPath = (configPath: string): string =>
  join(dirname(configPath), NOTICE_MARKER_FILE);

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
 * corrupt file can never stop a command; the notice state comes from its marker file.
 *
 * @param path - Settings file location.
 * @returns The boolean preferences found in the file.
 */
export const readTelemetrySettings = (path: string): TelemetrySettings => {
  const notice: TelemetrySettings = existsSync(resolveNoticeMarkerPath(path))
    ? { noticeShown: true }
    : {};
  try {
    const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
    // Only the known boolean preference is honoured; anything else is ignored.
    if (!raw || typeof raw !== 'object') return notice;
    const { enabled } = raw as Record<string, unknown>;
    return { ...(typeof enabled === 'boolean' ? { enabled } : {}), ...notice };
  } catch {
    return notice;
  }
};

/**
 * Persists the user's telemetry choice.
 *
 * The file is replaced atomically (write to a temporary file, then rename), so a concurrent run
 * never reads a half-written file and falls back to the default. Only `telemetry enable|disable`
 * writes this file, so an explicit opt-out cannot be overwritten by other CLI bookkeeping.
 *
 * @param path - Settings file location.
 * @param update - The choice to persist.
 * @returns The resulting settings.
 * @throws When the file cannot be written; callers decide whether that matters.
 */
export const writeTelemetrySettings = (
  path: string,
  update: Pick<TelemetrySettings, 'enabled'>,
): TelemetrySettings => {
  const { enabled } = { ...readTelemetrySettings(path), ...update };
  const persisted = enabled === undefined ? {} : { enabled };
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(persisted, null, 2)}\n`);
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
  return readTelemetrySettings(path);
};

/**
 * Records that the one-time collection notice has been shown, by creating a marker file next to
 * the settings file. Never touches the settings file itself, so it cannot undo an opt-out made
 * by a concurrent `telemetry disable`.
 *
 * @param path - Settings file location.
 * @throws When the marker cannot be created; callers decide whether that matters.
 */
export const markTelemetryNoticeShown = (path: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  try {
    writeFileSync(resolveNoticeMarkerPath(path), '', { flag: 'wx' });
  } catch (error) {
    // Another run already recorded the notice.
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  }
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
