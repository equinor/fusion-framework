import type { IMsalClient } from '../MsalClient.interface';
import type { MsalClientConfig } from '../MsalClient';
import { MsalMockClient } from './MsalMockClient';

/**
 * Convenience helper that creates a mock client instance.
 *
 * @remarks
 * The class form is preferred for a more familiar configuration pattern.
 *
 * @param config - The same client configuration the real client is built from.
 * @returns A client that resolves tokens in-process.
 */
export const createMsalMockClient = (config: MsalClientConfig): IMsalClient =>
  new MsalMockClient(config);
