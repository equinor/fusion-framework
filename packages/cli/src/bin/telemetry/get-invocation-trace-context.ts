import { invocationTraceState } from './invocation-trace-state.js';
import type { InvocationTraceContext } from './invocation-trace-state.js';

/**
 * Returns the trace identity of the running invocation, when telemetry is enabled.
 *
 * @returns The trace identity, or `undefined`.
 */
export const getInvocationTraceContext = (): InvocationTraceContext | undefined =>
  invocationTraceState.current;
