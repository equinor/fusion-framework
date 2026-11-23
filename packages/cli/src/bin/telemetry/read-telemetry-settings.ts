import { existsSync, readFileSync } from 'node:fs';

import { resolveNoticeMarkerPath } from './resolve-notice-marker-path.js';
import type { TelemetrySettings } from './types.js';

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
    // The separate marker is authoritative for whether to repeat the notice.
    return { ...(typeof enabled === 'boolean' ? { enabled } : {}), ...notice };
  } catch {
    return notice;
  }
};
