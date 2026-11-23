import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { resolveNoticeMarkerPath } from './resolve-notice-marker-path.js';

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
