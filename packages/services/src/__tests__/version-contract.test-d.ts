import { describe, expectTypeOf, it } from 'vitest';

import type { HttpClient, StreamResponse } from '@equinor/fusion-framework-module-http/client';

import type { SyntheticApiVersion } from './fixtures/synthetic-api-version';
import {
  syntheticEndpoint,
  type SyntheticArg,
  type SyntheticResponse,
} from './fixtures/synthetic-endpoint';

/**
 * Type-only client handle. The assertions never execute, so an unpopulated
 * declaration is enough to drive inference at the call sites below.
 */
declare const client: HttpClient;

describe('version discrimination across two versions', () => {
  it('infers a different argument shape per version', () => {
    expectTypeOf<SyntheticArg<'v1'>>().toEqualTypeOf<{ roleIdentifier: string }>();
    expectTypeOf<SyntheticArg<'v2'>>().toEqualTypeOf<{ roleId: string; scope: string }>();
    expectTypeOf<SyntheticArg<'v1'>>().not.toEqualTypeOf<SyntheticArg<'v2'>>();
  });

  it('treats the alias and the concrete version as the same version', () => {
    expectTypeOf<SyntheticArg<'1.0'>>().toEqualTypeOf<SyntheticArg<'v1'>>();
    expectTypeOf<SyntheticArg<'2.0'>>().toEqualTypeOf<SyntheticArg<'v2'>>();
    expectTypeOf<SyntheticResponse<'1.0'>>().toEqualTypeOf<SyntheticResponse<'v1'>>();
    expectTypeOf<SyntheticResponse<'2.0'>>().toEqualTypeOf<SyntheticResponse<'v2'>>();
    expectTypeOf<SyntheticArg<SyntheticApiVersion.v2>>().toEqualTypeOf<SyntheticArg<'v2'>>();
  });

  it('never leaks fields from one version into another', () => {
    expectTypeOf<SyntheticArg<'v1'>>().not.toHaveProperty('roleId');
    expectTypeOf<SyntheticArg<'v2'>>().not.toHaveProperty('roleIdentifier');
    expectTypeOf<SyntheticResponse<'v1'>>().toEqualTypeOf<{ id: string; name: string }>();
    expectTypeOf<SyntheticResponse<'v2'>>().toEqualTypeOf<{
      identifier: string;
      title: string;
      scope: string;
    }>();
    expectTypeOf<SyntheticResponse<'v1'>>().not.toHaveProperty('title');
  });

  it('binds the response type to the version the caller selected', () => {
    expectTypeOf(syntheticEndpoint('v1', client)({ roleIdentifier: 'role-1' })).toEqualTypeOf<
      Promise<{ id: string; name: string }>
    >();
    expectTypeOf(
      syntheticEndpoint('v2', client)({ roleId: 'role-1', scope: 'global' }),
    ).toEqualTypeOf<Promise<{ identifier: string; title: string; scope: string }>>();
    expectTypeOf(
      syntheticEndpoint('2.0', client, 'json$')({ roleId: 'role-1', scope: 'global' }),
    ).toEqualTypeOf<StreamResponse<{ identifier: string; title: string; scope: string }>>();
  });

  it("rejects one version's arguments when another version is selected", () => {
    // @ts-expect-error - version 2.0 arguments do not satisfy version 1.0.
    syntheticEndpoint('v1', client)({ roleId: 'role-1', scope: 'global' });
    // @ts-expect-error - version 1.0 arguments do not satisfy version 2.0.
    syntheticEndpoint('v2', client)({ roleIdentifier: 'role-1' });
    // @ts-expect-error - '3.0' is not a version the synthetic API publishes.
    syntheticEndpoint('3.0', client);
  });
});
