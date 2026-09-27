import type { MsalMockClient } from './MsalMockClient';
import type { MsalMockTokenAcquirer } from './types';

interface MockClientOperations {
  setAcquireToken(acquireToken: MsalMockTokenAcquirer): void;
}

const mockClientOperations = new WeakMap<MsalMockClient, MockClientOperations>();

/**
 * Registers private operations used by the mock configurator.
 *
 * @param client - Mock client owning the state.
 * @param operations - Private operations captured by the client.
 */
export function registerMockClientOperations(
  client: MsalMockClient,
  operations: MockClientOperations,
): void {
  mockClientOperations.set(client, operations);
}

/**
 * Injects configurator-owned token acquisition without exposing a client configuration API.
 *
 * @param client - Mock client receiving token acquisition.
 * @param acquireToken - Function that obtains a token for requested scopes.
 */
export function configureMockTokenAcquisition(
  client: MsalMockClient,
  acquireToken: MsalMockTokenAcquirer,
): void {
  const operations = mockClientOperations.get(client);
  if (!operations) {
    throw new Error('MsalMockClient: token-acquisition operation is unavailable');
  }
  operations.setAcquireToken(acquireToken);
}
