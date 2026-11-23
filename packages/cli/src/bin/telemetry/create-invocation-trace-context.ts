import { randomBytes } from 'node:crypto';

import type { InvocationTraceContext } from './invocation-trace-state.js';

/**
 * Creates a random W3C trace identity for one invocation.
 *
 * @returns A fresh trace id and root span id.
 */
export const createInvocationTraceContext = (): InvocationTraceContext => ({
  traceId: randomBytes(16).toString('hex'),
  spanId: randomBytes(8).toString('hex'),
});
