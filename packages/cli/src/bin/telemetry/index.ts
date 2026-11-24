/**
 * Shared Fusion Framework CLI telemetry state: opt-out and settings, destination, and the
 * invocation trace identity joined by outgoing Fusion requests.
 * @packageDocumentation
 */
export { createInvocationTraceContext } from './create-invocation-trace-context.js';
export { getInvocationTraceContext } from './get-invocation-trace-context.js';
export { markTelemetryNoticeShown } from './mark-telemetry-notice-shown.js';
export { readTelemetrySettings } from './read-telemetry-settings.js';
export { resolveTelemetryConfigPath } from './resolve-telemetry-config-path.js';
export { resolveTelemetryConnectionString } from './resolve-telemetry-connection-string.js';
export { resolveTelemetryState } from './resolve-telemetry-state.js';
export { setInvocationTraceContext } from './set-invocation-trace-context.js';
export {
  DEFAULT_TELEMETRY_CONNECTION_STRING,
  DO_NOT_TRACK_ENV,
  TELEMETRY_CONNECTION_STRING_ENV,
  TELEMETRY_OPTOUT_ENV,
} from './static.js';
export { traceRequest } from './trace-request.js';
export type {
  InvocationTraceContext,
  TelemetrySettings,
  TelemetryState,
  TelemetryStateReason,
} from './types.js';
export { writeTelemetrySettings } from './write-telemetry-settings.js';
