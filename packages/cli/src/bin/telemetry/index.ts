/**
 * Shared Fusion Framework CLI telemetry state: opt-out and settings, destination, and the
 * invocation trace identity joined by outgoing Fusion requests.
 * @packageDocumentation
 */
export {
  DO_NOT_TRACK_ENV,
  TELEMETRY_OPTOUT_ENV,
  readTelemetrySettings,
  resolveTelemetryConfigPath,
  resolveTelemetryState,
  writeTelemetrySettings,
  type TelemetrySettings,
  type TelemetryState,
  type TelemetryStateReason,
} from './telemetry-settings.js';
export {
  DEFAULT_TELEMETRY_CONNECTION_STRING,
  TELEMETRY_CONNECTION_STRING_ENV,
  resolveTelemetryConnectionString,
} from './connection-string.js';
export {
  createInvocationTraceContext,
  getInvocationTraceContext,
  setInvocationTraceContext,
  traceRequest,
  type InvocationTraceContext,
} from './trace-context.js';
