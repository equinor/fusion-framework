import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient, type StreamResponse } from '@equinor/fusion-framework-module-http/client';

import { getRole, listRoles } from '..';

import { BASE_URL } from '../../__tests__/fixtures/base-url';

/** A role payload that satisfies the version 1.0 role schema. */
const VALID_ROLE = {
  id: 'role-1',
  name: 'reader',
  displayName: 'Reader',
  system: { id: 'system-1', name: 'system' },
};

/** Resolves the first value an observable emits, without pulling in an RxJS import. */
const firstEmission = <T>(stream: StreamResponse<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    stream.subscribe({ next: resolve, error: reject });
  });

describe('client method selection', () => {
  let client: HttpClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // The endpoints are exercised against a stubbed transport, so the suite stays offline.
    fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(VALID_ROLE), {
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    client = new HttpClient(BASE_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves a validated payload when the 'json' method is selected", async () => {
    const role = await getRole('v1', client, 'json')({ roleIdentifier: 'role-1' });

    expect(role).toMatchObject(VALID_ROLE);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("defaults to the 'json' method when none is supplied", async () => {
    await expect(getRole('v1', client)({ roleIdentifier: 'role-1' })).resolves.toMatchObject(
      VALID_ROLE,
    );
  });

  it("emits a validated payload when the 'json$' method is selected", async () => {
    const stream = getRole('v1', client, 'json$')({ roleIdentifier: 'role-1' });

    expect(stream).toHaveProperty('subscribe');
    await expect(firstEmission(stream)).resolves.toMatchObject(VALID_ROLE);
  });

  it('defers the request until an observable result is subscribed to', async () => {
    const stream = listRoles('v1', client, 'json$')({ top: 5 });

    expect(fetchMock).not.toHaveBeenCalled();

    // A page envelope is required by the collection schema, so the stub is narrowed here.
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ totalCount: 1, value: [VALID_ROLE] }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(firstEmission(stream)).resolves.toMatchObject({ value: [VALID_ROLE] });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects a payload the version 1.0 response schema does not allow', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 42 }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(getRole('v1', client)({ roleIdentifier: 'role-1' })).rejects.toThrowError();
  });

  it('requests the version 1.0 path from the configured base URI', async () => {
    await getRole('v1', client)({ roleIdentifier: 'role-1' });

    const [request] = fetchMock.mock.calls.at(-1) as [string];

    expect(String(request)).toBe(`${BASE_URL}/roles/role-1?api-version=1.0`);
  });
});
