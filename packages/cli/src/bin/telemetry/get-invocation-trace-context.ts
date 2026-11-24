import { invocationTraceContext } from './invocation-trace-context.js';
import type { InvocationTraceContext } from './types.js';

/**
 * Returns the trace identity of the running invocation, when telemetry is enabled.
 * @returns The trace identity, or `undefined`.
 */
export const getInvocationTraceContext = (): InvocationTraceContext | undefined =>
  invocationTraceContext.current;
