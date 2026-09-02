import { beforeEach, describe, expect, it } from 'vitest';

import {
  createRoleBindingConfiguration,
  createRole,
  deleteRole,
  getRole,
  getRoleBindingConfiguration,
  listAccountConsolidatedRoleAssignments,
  listRoles,
  putRolesSubscription,
  updateRole,
} from '..';
import { ApiRoleSchemaV1 } from '../v1/schemas/api-role-schema-v1';
import { AddClaimableRoleAccessRoleRequestSchemaV1 } from '../v1/schemas/add-claimable-role-access-role-request-schema-v1';
import { AddRoleAccessRoleRequestSchemaV1 } from '../v1/schemas/add-role-access-role-request-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { DeleteRoleAssignmentsRequestSchemaV1 } from '../v1/schemas/delete-role-assignments-request-schema-v1';

import { createTestClient, type TestClient } from '../../__tests__/fixtures/create-test-client';

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

/** Reads the request body the endpoint attached to its request init. */
const bodyOf = (testClient: TestClient): unknown => {
  const [, init] = testClient.json.mock.calls.at(-1) as [string, { body?: unknown }];
  return init.body;
};

/** Builds a JSON `Response` the selector can parse, as the transport would deliver it. */
const jsonResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });

describe('Roles V2 schema enforcement', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient();
  });

  describe('response schemas', () => {
    it('parses a response with the version 1.0 schema the endpoint map points at', async () => {
      await getRoleBindingConfiguration('v1', testClient.client)({ identifier: 'binding-1' });
      await createRole('v1', testClient.client)({ name: 'reader', systemIdentifier: 'system-1' });

      const parsed = await selectorOf(testClient)(jsonResponse(VALID_ROLE));

      expect(parsed).toStrictEqual(ApiRoleSchemaV1.parse(VALID_ROLE));
    });

    it('rejects a response the version 1.0 contract does not allow', async () => {
      await createRole('v1', testClient.client)({ name: 'reader', systemIdentifier: 'system-1' });
      const selector = selectorOf(testClient);

      await expect(selector(jsonResponse({ id: 'role-1', name: 42 }))).rejects.toThrowError();
      await expect(selector(jsonResponse(null))).rejects.toThrowError();
    });

    it('validates a paged collection envelope with the version 1.0 item schema', async () => {
      await listRoles('v1', testClient.client)();
      const selector = selectorOf(testClient);
      const page = { totalCount: 1, count: 1, value: [VALID_ROLE] };

      expect(await selector(jsonResponse(page))).toStrictEqual(
        apiPagedCollectionSchemaV1(ApiRoleSchemaV1).parse(page),
      );
      await expect(selector(jsonResponse({ value: [VALID_ROLE] }))).rejects.toThrowError();
    });

    it('accepts the empty 201 response for a created role binding configuration', async () => {
      await createRoleBindingConfiguration('v1', testClient.client)({ identifier: 'binding-1' });

      await expect(
        selectorOf(testClient)(new Response(null, { status: 201 })),
      ).resolves.toBeUndefined();
    });
  });

  describe('argument schemas', () => {
    it('rejects empty mapping and assignment lists for batch mutation requests', () => {
      expect(AddRoleAccessRoleRequestSchemaV1.safeParse({}).success).toBe(false);
      expect(AddRoleAccessRoleRequestSchemaV1.safeParse({ accessRoleMappings: [] }).success).toBe(
        false,
      );
      expect(AddClaimableRoleAccessRoleRequestSchemaV1.safeParse({}).success).toBe(false);
      expect(
        AddClaimableRoleAccessRoleRequestSchemaV1.safeParse({ accessRoleMappings: [] }).success,
      ).toBe(false);
      expect(DeleteRoleAssignmentsRequestSchemaV1.safeParse({}).success).toBe(false);
      expect(
        DeleteRoleAssignmentsRequestSchemaV1.safeParse({ roleAssignmentIds: [] }).success,
      ).toBe(false);
    });

    it('rejects a query option outside the contract bounds before any request', () => {
      expect(() => listRoles('v1', testClient.client)({ top: 500 })).toThrowError();
      expect(() => listRoles('v1', testClient.client)({ skip: -1 })).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('rejects a mutation body field whose type the contract does not allow', () => {
      // Reaching the runtime guard requires a value the compiler would reject.
      const invalidBody = { name: 42 } as unknown as { name: string };

      expect(() => createRole('v1', testClient.client)(invalidBody)).toThrowError();
      expect(testClient.json).not.toHaveBeenCalled();
    });

    it('accepts documented optional arguments and forwards them as query options', () => {
      listRoles('v1', testClient.client)({ top: 10, skip: 5, expand: 'accessRoleMappings' });

      const [path] = testClient.json.mock.calls.at(-1) as [string];
      const params = new URL(path, 'https://localhost').searchParams;

      expect(params.get('$top')).toBe('10');
      expect(params.get('$skip')).toBe('5');
      expect(params.get('$expand')).toBe('accessRoleMappings');
    });
  });

  describe('request construction', () => {
    it('sends only body fields for a mutation, never the path identifiers', async () => {
      await updateRole(
        'v1',
        testClient.client,
      )({
        roleIdentifier: 'role-1',
        displayName: 'Reader',
      });

      const [path, init] = testClient.json.mock.calls.at(-1) as [string, { method?: string }];

      expect(path).toBe('/roles/role-1?api-version=1.0');
      expect(init.method).toBe('PATCH');
      expect(bodyOf(testClient)).toStrictEqual({ displayName: 'Reader' });
    });

    it('keeps caller headers while the contract method survives an init override', async () => {
      await deleteRole('v1', testClient.client)(
        { roleIdentifier: 'role-1' },
        // A caller may only decorate the request; the contract verb is not negotiable.
        { headers: { 'X-Custom': 'yes' }, method: 'GET' } as { headers: Record<string, string> },
      );

      const [, init] = testClient.json.mock.calls.at(-1) as [
        string,
        { method?: string; headers?: HeadersInit },
      ];

      expect(init.method).toBe('DELETE');
      expect(new Headers(init.headers).get('X-Custom')).toBe('yes');
    });

    it('ignores a caller-supplied selector on a GET request, so validation cannot be bypassed', async () => {
      // A selector that would accept any payload, standing in for a malicious override.
      const bypassSelector = async (response: Response) => response.json();

      await getRole('v1', testClient.client)({ roleIdentifier: 'role-1' }, {
        selector: bypassSelector,
        headers: { 'X-Custom': 'yes' },
      } as {
        selector: typeof bypassSelector;
        headers: Record<string, string>;
      });

      const [, init] = testClient.json.mock.calls.at(-1) as [
        string,
        { selector: (response: Response) => Promise<unknown>; headers?: HeadersInit },
      ];

      expect(init.selector).not.toBe(bypassSelector);
      await expect(init.selector(jsonResponse({ id: 42 }))).rejects.toThrowError();
      expect(new Headers(init.headers).get('X-Custom')).toBe('yes');
    });

    it('ignores a caller-supplied selector on a mutation request, so validation cannot be bypassed', async () => {
      // A selector that would accept any payload, standing in for a malicious override.
      const bypassSelector = async (response: Response) => response.json();

      await updateRole('v1', testClient.client)(
        { roleIdentifier: 'role-1', displayName: 'Reader' },
        { selector: bypassSelector, headers: { 'X-Custom': 'yes' } } as {
          selector: typeof bypassSelector;
          headers: Record<string, string>;
        },
      );

      const [, init] = testClient.json.mock.calls.at(-1) as [
        string,
        {
          selector: (response: Response) => Promise<unknown>;
          headers?: HeadersInit;
          method?: string;
        },
      ];

      expect(init.selector).not.toBe(bypassSelector);
      await expect(init.selector(jsonResponse({ id: 'role-1', name: 42 }))).rejects.toThrowError();
      // The generated method must also survive alongside the forced selector.
      expect(init.method).toBe('PATCH');
      expect(new Headers(init.headers).get('X-Custom')).toBe('yes');
    });

    it('encodes path identifiers that contain reserved characters', async () => {
      await listAccountConsolidatedRoleAssignments(
        'v1',
        testClient.client,
      )({
        accountIdentifier: 'user/name@example.com',
      });

      const [path] = testClient.json.mock.calls.at(-1) as [string];

      expect(path).toBe(
        '/accounts/user%2Fname%40example.com/consolidated-role-assignments?api-version=1.0',
      );
    });

    it('builds a PUT subscription request from the version 1.0 request schema', async () => {
      await putRolesSubscription('v1', testClient.client)({ identifier: 'my-subscriber' });

      const [path, init] = testClient.json.mock.calls.at(-1) as [string, { method?: string }];

      expect(path).toBe('/subscriptions/roles-v2?api-version=1.0');
      expect(init.method).toBe('PUT');
      expect(bodyOf(testClient)).toMatchObject({ identifier: 'my-subscriber' });
    });
  });
});
