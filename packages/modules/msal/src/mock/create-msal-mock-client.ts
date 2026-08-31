import type { IMsalClient } from '../MsalClient.interface';
import type { MsalClientConfig } from '../MsalClient';
import { MsalMockClient, type MsalMockUser } from './MsalMockClient';

/**
 * Convenience helper that creates a mock client instance.
 *
 * @remarks
 * The class form is preferred for a more familiar configuration pattern.
 *
 * @param config - The same client configuration the real client is built from.
 * @param user - Optional user to sign in, applied after construction.
 * @returns A client that resolves tokens in-process.
 */
export const createMsalMockClient = (
  config: MsalClientConfig,
  user?: MsalMockUser,
): IMsalClient => {
  const client = new MsalMockClient(config);
  // Apply the optional identity after construction so the helper matches setUser semantics.
  if (user) {
    client.setUser(user);
  }
  return client;
};
