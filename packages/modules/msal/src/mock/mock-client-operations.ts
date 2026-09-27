import type { MsalMockClient } from './MsalMockClient';
import type { MsalMockTokenAcquirer } from './types';

interface MockClientOperations {
  setAcquireToken(acquireToken: MsalMockTokenAcquirer): void;
}

const clientOperations = new WeakMap<MsalMockClient, MockClientOperations>();

/**
 * Bridges configurator-owned token acquisition into a mock client without exposing mutation APIs.
 */
export const mockClientOperations = {
  /**
   * Registers the private operations captured by a mock client.
   *
   * @param client - Mock client owning the state.
   * @param operations - Private operations captured by the client.
   */
  register(client: MsalMockClient, operations: MockClientOperations): void {
    clientOperations.set(client, operations);
  },

  /**
   * Injects configurator-owned token acquisition into a registered mock client.
   *
   * @param client - Mock client receiving token acquisition.
   * @param acquireToken - Function that obtains a token for requested scopes.
   * @throws When the client has not registered its private operations.
   */
  configure(client: MsalMockClient, acquireToken: MsalMockTokenAcquirer): void {
    const operations = clientOperations.get(client);
    // Configuration must not silently succeed when called for an unknown client.
    if (!operations) {
      throw new Error('MsalMockClient: token-acquisition operation is unavailable');
    }
    operations.setAcquireToken(acquireToken);
  },
};
