import { beforeEach, describe, expect, it } from 'vitest';

import type { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { createTestClient, type TestClient } from './fixtures/create-test-client';
import { SyntheticApiVersion } from './fixtures/synthetic-api-version';
import { syntheticEndpoint } from './fixtures/synthetic-endpoint';

/**
 * Test-only view of `syntheticEndpoint` whose version parameter accepts any
 * string, so the runtime version guard can be exercised from a suite that the
 * compiler would otherwise stop at the call site.
 */
type UnversionedSyntheticEndpoint = (version: string, client: HttpClient) => unknown;

/** A response payload that satisfies the synthetic version 1.0 response schema. */
const SYNTHETIC_V1_RESPONSE = { id: 'role-1', name: 'reader' };

/** A response payload that satisfies the synthetic version 2.0 response schema. */
const SYNTHETIC_V2_RESPONSE = { identifier: 'role-1', title: 'Reader', scope: 'global' };

describe('version discrimination at runtime', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient();
  });

  it("treats a version's key and its raw value as the same version", async () => {
    await syntheticEndpoint('v1', testClient.client)({ roleIdentifier: 'role-1' });
    const [byKey] = testClient.json.mock.calls.at(-1) as [string];

    await syntheticEndpoint('1.0', testClient.client)({ roleIdentifier: 'role-1' });
    const [byValue] = testClient.json.mock.calls.at(-1) as [string];

    expect(byKey).toBe(byValue);
    expect(byKey).toBe(`/things/role-1?api-version=${SyntheticApiVersion.v1}`);
  });

  it('builds a version-specific request path, since each version addresses its resource differently', async () => {
    await syntheticEndpoint('v1', testClient.client)({ roleIdentifier: 'role-1' });
    const [v1Path] = testClient.json.mock.calls.at(-1) as [string];

    await syntheticEndpoint('v2', testClient.client)({ roleId: 'role-1', scope: 'global' });
    const [v2Path] = testClient.json.mock.calls.at(-1) as [string];

    expect(v1Path).toBe('/things/role-1?api-version=1.0');
    expect(v2Path).toBe('/things/role-1?api-version=2.0&scope=global');
  });

  it('rejects version 2.0 arguments when version 1.0 is selected', () => {
    const v2Args = { roleId: 'role-1', scope: 'global' } as unknown as { roleIdentifier: string };
    expect(() => syntheticEndpoint('v1', testClient.client)(v2Args)).toThrowError();
    expect(testClient.json).not.toHaveBeenCalled();
  });

  it('rejects version 1.0 arguments when version 2.0 is selected', () => {
    const v1Args = { roleIdentifier: 'role-1' } as unknown as { roleId: string; scope: string };
    expect(() => syntheticEndpoint('v2', testClient.client)(v1Args)).toThrowError();
    expect(testClient.json).not.toHaveBeenCalled();
  });

  it('selects the response schema of the resolved version, not a union of both', async () => {
    testClient.json.mockResolvedValueOnce(SYNTHETIC_V1_RESPONSE);
    await expect(
      syntheticEndpoint('v1', testClient.client)({ roleIdentifier: 'role-1' }),
    ).resolves.toStrictEqual(SYNTHETIC_V1_RESPONSE);

    testClient.json.mockResolvedValueOnce(SYNTHETIC_V2_RESPONSE);
    await expect(
      syntheticEndpoint('v2', testClient.client)({ roleId: 'role-1', scope: 'global' }),
    ).resolves.toStrictEqual(SYNTHETIC_V2_RESPONSE);
  });

  it('rejects a version the synthetic API does not publish', () => {
    // The factory signature only admits versions 1.0 and 2.0, so reaching the
    // runtime guard requires stepping outside the type system exactly as a
    // JavaScript caller would.
    const withAnyVersion = syntheticEndpoint as unknown as UnversionedSyntheticEndpoint;

    expect(() => withAnyVersion('3.0', testClient.client)).toThrowError(
      'Version 3.0 is not supported',
    );
    expect(testClient.json).not.toHaveBeenCalled();
  });
});
