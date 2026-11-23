import { invocationTraceContext } from './invocation-trace-context.js';
import type { InvocationTraceContext } from './types.js';

/**
 * Sets, or clears with `undefined`, the trace identity that outgoing Fusion requests join.
 * The CLI sets it only while telemetry is enabled, so opted-out runs send no `traceparent`.
 *
 * @param context - Trace identity of the running invocation.
 */
export const setInvocationTraceContext = (context: InvocationTraceContext | undefined): void => {
  invocationTraceContext.current = context;
};
