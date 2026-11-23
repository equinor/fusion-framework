import { randomBytes } from 'node:crypto';

import type { InvocationTraceContext } from './types.js';

/**
 * Creates a random W3C trace identity for one invocation.
 * @returns A fresh trace id and root span id.
 */
export const createInvocationTraceContext = (): InvocationTraceContext => ({
  traceId: randomBytes(16).toString('hex'),
  spanId: randomBytes(8).toString('hex'),
});
