import { beforeEach, describe, expect, it } from 'vitest';

import type { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion, getApp, listAppBuilds, listApps } from '..';
import { extractVersion } from '../../utils';

import { createTestClient, type TestClient } from '../../__tests__/fixtures/create-test-client';

/**
 * Test-only view of an endpoint factory whose version parameter accepts any
 * string, so the runtime version guard can be exercised from a suite that the
 * compiler would otherwise stop at the call site.
 */
type UnversionedEndpointFactory = (version: string, client: HttpClient) => unknown;

/** An app payload that satisfies the version 1.0 app schema. */
const VALID_APP = {
  id: '00000000-0000-0000-0000-000000000001',
  appKey: 'my-app',
  displayName: 'My app',
  type: 'standalone',
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
      await getApp('v1', testClient.client)({ appIdentifier: 'my-app' });
      const [byKey] = testClient.json.mock.calls.at(-1) as [string];

      await getApp('1.0', testClient.client)({ appIdentifier: 'my-app' });
      const [byValue] = testClient.json.mock.calls.at(-1) as [string];

      expect(byKey).toBe(byValue);
      expect(byKey).toBe(`/apps/my-app?api-version=${ApiVersion.v1}`);
    });

    it('writes the resolved version into the api-version query parameter', async () => {
      await listApps('v1', testClient.client)({ search: 'my' });
      const [path] = testClient.json.mock.calls.at(-1) as [string];

      expect(new URL(path, 'https://localhost').searchParams.get('api-version')).toBe('1.0');
      expect(path).not.toContain('api-version=v1');
    });

    it('rejects an unsupported version before the client is invoked', () => {
      // The factory signature only admits version 1.0, so reaching the runtime guard
      // requires stepping outside the type system exactly as a JavaScript caller would.
      const withAnyVersion = getApp as unknown as UnversionedEndpointFactory;

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
      const invalidArgs = { appIdentifier: 42 } as unknown as { appIdentifier: string };

      expect(() => getApp('v1', testClient.client)(invalidArgs)).toThrowError();
      expect(() => getApp('1.0', testClient.client)(invalidArgs)).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('selects the same response schema for both version spellings', async () => {
      await getApp('v1', testClient.client)({ appIdentifier: 'my-app' });
      const byKey = selectorOf(testClient);

      await getApp('1.0', testClient.client)({ appIdentifier: 'my-app' });
      const byValue = selectorOf(testClient);

      await expect(byKey(jsonResponse(VALID_APP))).resolves.toMatchObject(VALID_APP);
      await expect(byValue(jsonResponse(VALID_APP))).resolves.toMatchObject(VALID_APP);
      await expect(byKey(jsonResponse({ appKey: 42 }))).rejects.toThrowError();
      await expect(byValue(jsonResponse({ appKey: 42 }))).rejects.toThrowError();
    });

    it('binds the version once for every request the returned function makes', async () => {
      const listBuilds = listAppBuilds(ApiVersion.v1, testClient.client);

      await listBuilds({ appIdentifier: 'my-app' });
      await listBuilds({ appIdentifier: 'other-app' });

      const paths = testClient.json.mock.calls.map(([path]) => path as string);
      expect(paths).toEqual([
        `/apps/my-app/builds?api-version=${ApiVersion.v1}`,
        `/apps/other-app/builds?api-version=${ApiVersion.v1}`,
      ]);
    });
  });
});
