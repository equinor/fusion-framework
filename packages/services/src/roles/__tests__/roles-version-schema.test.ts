import { beforeEach, describe, expect, it } from 'vitest';

import type { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion, getRole, listRoles } from '..';
import { extractVersion } from '../../utils';

import { createTestClient, type TestClient } from '../../__tests__/fixtures/create-test-client';

/**
 * Test-only view of an endpoint factory whose version parameter accepts any
 * string, so the runtime version guard can be exercised from a suite that the
 * compiler would otherwise stop at the call site.
 */
type UnversionedEndpointFactory = (version: string, client: HttpClient) => unknown;

/** A role payload that satisfies the version 1.0 role schema. */
const VALID_ROLE = {
  id: 'role-1',
  name: 'reader',
  displayName: 'Reader',
  system: { id: 'system-1', name: 'system' },
};

/** Reads the response selector the endpoint attached to its request init. */
const selectorOf = (testClient: TestClient): ((response: Response) => Promise<unknown>) => {
  const [, init] = testClient.json.mock.calls.at(-1) as [
    string,
    { selector: (response: Response) => Promise<unknown> },
  ];
  return init.selector;
};

/** Builds a JSON `Response` the selector can parse, as the transport would deliver it. */
const jsonResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });

describe('API version resolution', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient();
  });

  describe('extractVersion', () => {
    it('resolves the version key and the concrete version to the same value', () => {
      expect(extractVersion(ApiVersion, 'v1')).toBe(ApiVersion.v1);
      expect(extractVersion(ApiVersion, '1.0')).toBe(ApiVersion.v1);
      expect(extractVersion(ApiVersion, 'v1')).toBe(extractVersion(ApiVersion, '1.0'));
    });

    it('throws for a version the service does not publish', () => {
      expect(() => extractVersion(ApiVersion, 'v2')).toThrowError('Version v2 is not supported');
      expect(() => extractVersion(ApiVersion, '2.0')).toThrowError('Version 2.0 is not supported');
    });
  });

  describe('endpoint version binding', () => {
    it("treats the key 'v1' and the value '1.0' as the same version", async () => {
      await getRole('v1', testClient.client)({ roleIdentifier: 'role-1' });
      const [byKey] = testClient.json.mock.calls.at(-1) as [string];

      await getRole('1.0', testClient.client)({ roleIdentifier: 'role-1' });
      const [byValue] = testClient.json.mock.calls.at(-1) as [string];

      expect(byKey).toBe(byValue);
      expect(byKey).toBe(`/roles/role-1?api-version=${ApiVersion.v1}`);
    });

    it('writes the resolved version into the api-version query parameter', async () => {
      await listRoles('v1', testClient.client)({ top: 10 });
      const [path] = testClient.json.mock.calls.at(-1) as [string];

      expect(new URL(path, 'https://localhost').searchParams.get('api-version')).toBe('1.0');
      expect(path).not.toContain('api-version=v1');
    });

    it('rejects an unsupported version before the client is invoked', () => {
      // The factory signature only admits version 1.0, so reaching the runtime guard
      // requires stepping outside the type system exactly as a JavaScript caller would.
      const withAnyVersion = getRole as unknown as UnversionedEndpointFactory;

      expect(() => withAnyVersion('v2', testClient.client)).toThrowError(
        'Version v2 is not supported',
      );
      expect(() => withAnyVersion('2.0', testClient.client)).toThrowError(
        'Version 2.0 is not supported',
      );
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('validates arguments with the version 1.0 schema before any request is made', () => {
      // Reaching the argument guard requires a value the compiler would reject.
      const invalidArgs = { roleIdentifier: 42 } as unknown as { roleIdentifier: string };

      expect(() => getRole('v1', testClient.client)(invalidArgs)).toThrowError();
      expect(() => getRole('1.0', testClient.client)(invalidArgs)).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('selects the same response schema for both version spellings', async () => {
      await getRole('v1', testClient.client)({ roleIdentifier: 'role-1' });
      const byKey = selectorOf(testClient);

      await getRole('1.0', testClient.client)({ roleIdentifier: 'role-1' });
      const byValue = selectorOf(testClient);

      await expect(byKey(jsonResponse(VALID_ROLE))).resolves.toMatchObject(VALID_ROLE);
      await expect(byValue(jsonResponse(VALID_ROLE))).resolves.toMatchObject(VALID_ROLE);
      await expect(byKey(jsonResponse({ id: 42 }))).rejects.toThrowError();
      await expect(byValue(jsonResponse({ id: 42 }))).rejects.toThrowError();
    });
  });
});
