import { dirname, join } from 'node:path';

/** Name of the marker file, next to the settings file, that records the notice was shown. */
const NOTICE_MARKER_FILE = 'telemetry-notice-shown';

/** Resolves the one-time notice marker beside the telemetry settings file. */
export const resolveNoticeMarkerPath = (configPath: string): string =>
  join(dirname(configPath), NOTICE_MARKER_FILE);
