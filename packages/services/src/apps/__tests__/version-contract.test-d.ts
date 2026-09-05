import type { z } from 'zod';

import { describe, expectTypeOf, it } from 'vitest';

import type { HttpClient, StreamResponse } from '@equinor/fusion-framework-module-http/client';

import {
  ApiVersion,
  getApp,
  listApps,
  type ApiAppListItemV1,
  type ApiAppV1,
  type ApiPagedCollectionV1,
  type CreateAppArg,
  type CreateAppRequestV1,
  type GetAppArg,
  type GetAppResponse,
  type GetAppResult,
} from '..';
import { createApp } from '..';
import type { ApiAppSchemaV1 } from '../v1/schemas/api-app-schema-v1';
import type { CreateAppRequestSchemaV1 } from '../v1/schemas/create-app-request-schema-v1';
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
    expectTypeOf<GetAppArg<'v1'>>().toEqualTypeOf<{ appIdentifier: string }>();
    expectTypeOf<GetAppArg<'1.0'>>().toEqualTypeOf<GetAppArg<'v1'>>();
    expectTypeOf<GetAppArg<ApiVersion.v1>>().toEqualTypeOf<GetAppArg<'v1'>>();
  });

  it('infers the response type from the version 1.0 Zod response schema', () => {
    // The schema is the source of truth; the endpoint type is derived from it, never declared.
    expectTypeOf<GetAppResponse<'v1'>>().toEqualTypeOf<z.infer<typeof ApiAppSchemaV1>>();
    expectTypeOf<ApiAppV1>().toEqualTypeOf<z.infer<typeof ApiAppSchemaV1>>();
  });

  it('infers the argument type from the version 1.0 Zod request schema', () => {
    expectTypeOf<CreateAppArg<'v1'>>().toEqualTypeOf<z.input<typeof CreateAppRequestSchemaV1>>();
    expectTypeOf<CreateAppRequestV1>().toEqualTypeOf<z.infer<typeof CreateAppRequestSchemaV1>>();
    // The operation has no required arguments, so its input parameter is optional.
    expectTypeOf(createApp('v1', client))
      .parameter(0)
      .toEqualTypeOf<CreateAppArg<'1.0'> | undefined>();
  });

  it('rejects caller-supplied response generics while preserving method result typing', () => {
    // @ts-expect-error - the response type is fixed by the selected API version.
    createApp('v1', client)<string>();
    // The operation answers `201 Created` without a body, so the result carries no payload.
    expectTypeOf(createApp('v1', client)()).toEqualTypeOf<Promise<void>>();
    expectTypeOf(createApp('v1', client, 'json$')()).toEqualTypeOf<StreamResponse<void>>();
  });

  it('infers the same response from a version key, a version value, and the enum member', () => {
    expectTypeOf<GetAppResponse<'v1'>>().toEqualTypeOf<ApiAppV1>();
    expectTypeOf<GetAppResponse<'1.0'>>().toEqualTypeOf<GetAppResponse<'v1'>>();
    expectTypeOf<GetAppResponse<ApiVersion.v1>>().toEqualTypeOf<GetAppResponse<'v1'>>();
  });

  it('types the request function from the version passed to the endpoint', () => {
    expectTypeOf(getApp('v1', client)).parameter(0).toEqualTypeOf<{ appIdentifier: string }>();
    expectTypeOf(getApp('1.0', client)).parameter(0).toEqualTypeOf<{ appIdentifier: string }>();
  });

  it('defaults to a promise result and switches to a stream on request', () => {
    expectTypeOf(getApp('v1', client)({ appIdentifier: 'my-app' })).toEqualTypeOf<
      Promise<ApiAppV1>
    >();
    expectTypeOf(getApp('v1', client, 'json')({ appIdentifier: 'my-app' })).toEqualTypeOf<
      Promise<ApiAppV1>
    >();
    expectTypeOf(getApp('v1', client, 'json$')({ appIdentifier: 'my-app' })).toEqualTypeOf<
      StreamResponse<ApiAppV1>
    >();
    expectTypeOf<GetAppResult<'v1'>>().toEqualTypeOf<Promise<ApiAppV1>>();
  });

  it('carries the version response type through collection endpoints', () => {
    expectTypeOf(listApps('v1', client)({ search: 'my' })).toEqualTypeOf<
      Promise<ApiPagedCollectionV1<ApiAppListItemV1>>
    >();
  });

  it('rejects a version the service does not publish', () => {
    // @ts-expect-error - the Apps service publishes version 1.0 only.
    getApp('v2', client);
    // @ts-expect-error - '2.0' is not a version this endpoint publishes.
    getApp('2.0', client);
  });

  it('rejects arguments the selected version does not accept', () => {
    // @ts-expect-error - version 1.0 addresses an app by `appIdentifier`.
    getApp('v1', client)({ appId: 'my-app' });
    // @ts-expect-error - the query option is named `search`, not `$search`.
    listApps('v1', client)({ $search: 'my' });
  });
});
