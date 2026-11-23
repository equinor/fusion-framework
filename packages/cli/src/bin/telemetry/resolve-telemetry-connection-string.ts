import { DEFAULT_TELEMETRY_CONNECTION_STRING } from './default-telemetry-connection-string.js';
import { TELEMETRY_CONNECTION_STRING_ENV } from './telemetry-connection-string-env.js';

/**
 * Resolves the telemetry destination: the override when set and non-empty, else the default.
 *
 * @param env - Environment to read; defaults to `process.env`.
 * @returns The Application Insights connection string to export to.
 */
export const resolveTelemetryConnectionString = (env: NodeJS.ProcessEnv = process.env): string =>
  env[TELEMETRY_CONNECTION_STRING_ENV]?.trim() || DEFAULT_TELEMETRY_CONNECTION_STRING;
