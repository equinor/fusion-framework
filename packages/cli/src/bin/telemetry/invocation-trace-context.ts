import type { InvocationTraceContext } from './types.js';

/** Shared trace identity for the active CLI invocation, if collection is enabled. */
export const invocationTraceContext: { current: InvocationTraceContext | undefined } = {
  current: undefined,
};
