import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { TelemetrySettings } from './telemetry-settings-types.js';
import { readTelemetrySettings } from './read-telemetry-settings.js';

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
  const { enabled } = update;
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
