import { beforeEach, describe, expect, it } from 'vitest';

import {
  createApp,
  getApp,
  getMyAppSettings,
  listApps,
  queryAppFeatureEvents,
  updateApp,
  upsertPersonAppSettings,
} from '..';
import { ApiAppListItemSchemaV1 } from '../v1/schemas/api-app-list-item-schema-v1';
import { ApiAppSchemaV1 } from '../v1/schemas/api-app-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { CreateAppRequestSchemaV1 } from '../v1/schemas/create-app-request-schema-v1';
import { PatchAppRequestSchemaV1 } from '../v1/schemas/patch-app-request-schema-v1';

import { createTestClient, type TestClient } from '../../__tests__/fixtures/create-test-client';

/** An app payload that satisfies the version 1.0 app schema. */
const VALID_APP = {
  id: '00000000-0000-0000-0000-000000000001',
  appKey: 'my-app',
  displayName: 'My app',
  type: 'standalone',
  build: { version: '1.2.3' },
};

/** Reads the response selector the endpoint attached to its request init. */
const selectorOf = (testClient: TestClient): ((response: Response) => Promise<unknown>) => {
  const [, init] = testClient.json.mock.calls.at(-1) as [
    string,
    { selector: (response: Response) => Promise<unknown> },
  ];
  return init.selector;
};

/** Reads the request body the endpoint attached to its request init. */
const bodyOf = (testClient: TestClient): unknown => {
  const [, init] = testClient.json.mock.calls.at(-1) as [string, { body?: unknown }];
  return init.body;
};

/** Builds a JSON `Response` the selector can parse, as the transport would deliver it. */
const jsonResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });

describe('Fusion Apps schema enforcement', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient();
  });

  describe('response schemas', () => {
    it('parses a response with the version 1.0 schema the endpoint contract points at', async () => {
      await getApp('v1', testClient.client)({ appIdentifier: 'my-app' });

      const parsed = await selectorOf(testClient)(jsonResponse(VALID_APP));

      expect(parsed).toStrictEqual(ApiAppSchemaV1.parse(VALID_APP));
    });

    it('rejects a response the version 1.0 contract does not allow', async () => {
      await getApp('v1', testClient.client)({ appIdentifier: 'my-app' });
      const selector = selectorOf(testClient);

      await expect(selector(jsonResponse({ appKey: 42 }))).rejects.toThrowError();
      await expect(selector(jsonResponse(null))).rejects.toThrowError();
    });

    it('validates a paged collection envelope with the version 1.0 item schema', async () => {
      await listApps('v1', testClient.client)();
      const page = { totalCount: 1, count: 1, value: [VALID_APP] };

      expect(await selectorOf(testClient)(jsonResponse(page))).toStrictEqual(
        apiPagedCollectionSchemaV1(ApiAppListItemSchemaV1).parse(page),
      );
    });

    it('rejects a page whose items do not satisfy the item schema', async () => {
      await listApps('v1', testClient.client)();

      await expect(
        selectorOf(testClient)(jsonResponse({ totalCount: 1, value: [{ appKey: 42 }] })),
      ).rejects.toThrowError();
    });

    it('passes an undocumented success body through unvalidated', async () => {
      await getMyAppSettings('v1', testClient.client)({ appIdentifier: 'my-app' });

      // The contract publishes no schema for these settings, so any JSON document is accepted.
      await expect(selectorOf(testClient)(jsonResponse({ theme: 'dark' }))).resolves.toEqual({
        theme: 'dark',
      });
    });
  });

  describe('argument schemas', () => {
    it('rejects arguments the version 1.0 request schema does not allow', () => {
      // Reaching the argument guard requires values the compiler would reject.
      const invalidIdentifier = { appIdentifier: 42 } as unknown as { appIdentifier: string };
      const invalidBody = {
        appIdentifier: 'my-app',
        displayName: 42,
      } as unknown as { appIdentifier: string; displayName: string };

      expect(() => getApp('v1', testClient.client)(invalidIdentifier)).toThrowError();
      expect(() => updateApp('v1', testClient.client)(invalidBody)).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('rejects a mutation that omits a required request-body field', () => {
      // `query` is the only field the feature-events contract marks as required.
      const withoutQuery = {} as unknown as { query: string };

      expect(() => queryAppFeatureEvents('v1', testClient.client)(withoutQuery)).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('accepts the request-body fields the version 1.0 schema publishes', async () => {
      const request = { appKey: 'my-app', displayName: 'My app' };
      await createApp('v1', testClient.client)(request);

      expect(bodyOf(testClient)).toStrictEqual(CreateAppRequestSchemaV1.parse(request));
    });

    it('keeps path identifiers out of the request body of a mutation', async () => {
      const request = { displayName: 'Renamed app' };
      await updateApp('v1', testClient.client)({ appIdentifier: 'my-app', ...request });

      expect(bodyOf(testClient)).toStrictEqual(PatchAppRequestSchemaV1.parse(request));
    });

    it('sends a dictionary request body as the document the contract declares', async () => {
      await upsertPersonAppSettings(
        'v1',
        testClient.client,
      )({
        accountIdentifier: 'user@equinor.com',
        appIdentifier: 'my-app',
        settings: { theme: 'dark' },
      });

      expect(bodyOf(testClient)).toStrictEqual({ theme: 'dark' });
    });
  });
});
