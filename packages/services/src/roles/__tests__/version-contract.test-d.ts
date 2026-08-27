import type { z } from 'zod';

import { describe, expectTypeOf, it } from 'vitest';

import type { HttpClient, StreamResponse } from '@equinor/fusion-framework-module-http/client';

import {
  ApiVersion,
  getRole,
  listRoles,
  type ApiPagedCollectionV1,
  type ApiRoleV1,
  type CreateRoleArg,
  type CreateRoleRequestV1,
  type GetRoleArg,
  type GetRoleResponse,
  type GetRoleResult,
} from '..';
import { createRole } from '..';
import type { ApiRoleSchemaV1 } from '../v1/schemas/api-role-schema-v1';
import type { CreateRoleRequestSchemaV1 } from '../v1/schemas/create-role-request-schema-v1';
import { extractVersion } from '../../utils';

/**
 * Type-only client handle. The assertions never execute, so an unpopulated
 * declaration is enough to drive inference at the call sites below.
 */
declare const client: HttpClient;

describe('version-coupled endpoint typing', () => {
  it('resolves both spellings of a version to the same concrete version', () => {
    expectTypeOf(extractVersion(ApiVersion, 'v1')).toEqualTypeOf<ApiVersion.v1>();
    expectTypeOf(extractVersion(ApiVersion, '1.0')).toEqualTypeOf<ApiVersion.v1>();
    expectTypeOf(extractVersion(ApiVersion, ApiVersion.v1)).toEqualTypeOf<ApiVersion.v1>();
  });

  it('infers the same arguments from a version key, a version value, and the enum member', () => {
    expectTypeOf<GetRoleArg<'v1'>>().toEqualTypeOf<{ roleIdentifier: string }>();
    expectTypeOf<GetRoleArg<'1.0'>>().toEqualTypeOf<GetRoleArg<'v1'>>();
    expectTypeOf<GetRoleArg<ApiVersion.v1>>().toEqualTypeOf<GetRoleArg<'v1'>>();
  });

  it('infers the response type from the version 1.0 Zod response schema', () => {
    // The schema is the source of truth; the endpoint type is derived from it, never declared.
    expectTypeOf<GetRoleResponse<'v1'>>().toEqualTypeOf<z.infer<typeof ApiRoleSchemaV1>>();
    expectTypeOf<ApiRoleV1>().toEqualTypeOf<z.infer<typeof ApiRoleSchemaV1>>();
  });

  it('infers the argument type from the version 1.0 Zod request schema', () => {
    expectTypeOf<CreateRoleArg<'v1'>>().toEqualTypeOf<z.input<typeof CreateRoleRequestSchemaV1>>();
    expectTypeOf<CreateRoleRequestV1>().toEqualTypeOf<z.infer<typeof CreateRoleRequestSchemaV1>>();
    // The operation has no required arguments, so its input parameter is optional.
    expectTypeOf(createRole('v1', client))
      .parameter(0)
      .toEqualTypeOf<CreateRoleArg<'1.0'> | undefined>();
  });

  it('infers the same response from a version key, a version value, and the enum member', () => {
    expectTypeOf<GetRoleResponse<'v1'>>().toEqualTypeOf<ApiRoleV1>();
    expectTypeOf<GetRoleResponse<'1.0'>>().toEqualTypeOf<GetRoleResponse<'v1'>>();
    expectTypeOf<GetRoleResponse<ApiVersion.v1>>().toEqualTypeOf<GetRoleResponse<'v1'>>();
  });

  it('types the request function from the version passed to the endpoint', () => {
    expectTypeOf(getRole('v1', client)).parameter(0).toEqualTypeOf<{ roleIdentifier: string }>();
    expectTypeOf(getRole('1.0', client)).parameter(0).toEqualTypeOf<{ roleIdentifier: string }>();
  });

  it('defaults to a promise result and switches to a stream on request', () => {
    expectTypeOf(getRole('v1', client)({ roleIdentifier: 'role-1' })).toEqualTypeOf<
      Promise<ApiRoleV1>
    >();
    expectTypeOf(getRole('v1', client, 'json')({ roleIdentifier: 'role-1' })).toEqualTypeOf<
      Promise<ApiRoleV1>
    >();
    expectTypeOf(getRole('v1', client, 'json$')({ roleIdentifier: 'role-1' })).toEqualTypeOf<
      StreamResponse<ApiRoleV1>
    >();
    expectTypeOf<GetRoleResult<'v1'>>().toEqualTypeOf<Promise<ApiRoleV1>>();
  });

  it('carries the version response type through collection endpoints', () => {
    expectTypeOf(listRoles('v1', client)({ top: 10 })).toEqualTypeOf<
      Promise<ApiPagedCollectionV1<ApiRoleV1>>
    >();
  });

  it('rejects a version the service does not publish', () => {
    // @ts-expect-error - Roles V2 publishes version 1.0 only.
    getRole('v2', client);
    // @ts-expect-error - '2.0' is not a version this endpoint publishes.
    getRole('2.0', client);
  });

  it('rejects arguments the selected version does not accept', () => {
    // @ts-expect-error - version 1.0 addresses a role by `roleIdentifier`.
    getRole('v1', client)({ roleId: 'role-1' });
    // @ts-expect-error - `$top` above 100 is still a number, but the field name is `top`.
    listRoles('v1', client)({ $top: 10 });
  });
});
