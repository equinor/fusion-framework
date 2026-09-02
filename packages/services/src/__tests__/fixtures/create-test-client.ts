import { vi, type MockInstance } from 'vitest';

import { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { BASE_URL } from './base-url';

/** An `HttpClient` whose transport methods are replaced by recording spies. */
export type TestClient = {
  /** The client instance handed to endpoint functions. */
  client: HttpClient;
  /** Spy recording every `json()` call as `[path, init]`. */
  json: MockInstance;
  /** Spy recording every `json$()` call as `[path, init]`. */
  json$: MockInstance;
};

/**
 * Creates an `HttpClient` whose `json` and `json$` methods are stubbed.
 *
 * Endpoint functions only build a path and a request init and hand them to the
 * client, so stubbing the transport keeps the whole suite deterministic and
 * offline while still recording exactly what each endpoint would have sent.
 *
 * @param response - Value the stubbed `json()` resolves with.
 * @returns The client together with the spies recording its calls.
 *
 * @example
 * ```ts
 * const { client, json } = createTestClient({ id: 'role-1' });
 * await getRole('v1', client)({ roleIdentifier: 'role-1' });
 * expect(json).toHaveBeenCalledWith('/roles/role-1?api-version=1.0', expect.anything());
 * ```
 */
export const createTestClient = (response: unknown = undefined): TestClient => {
  const client = new HttpClient(BASE_URL);
  return {
    client,
    json: vi.spyOn(client, 'json').mockResolvedValue(response),
    json$: vi.spyOn(client, 'json$'),
  };
};
