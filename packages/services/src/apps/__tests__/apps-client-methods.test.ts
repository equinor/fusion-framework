import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { HttpClient, type StreamResponse } from '@equinor/fusion-framework-module-http/client';

import { getApp, getAppBundleArchive, listApps, resetAppsCache, updateApp } from '..';
import type { ApiAppV1 } from '../v1/types';

import { BASE_URL } from '../../__tests__/fixtures/base-url';

/** An app payload that satisfies the version 1.0 app schema. */
const VALID_APP = {
  id: '00000000-0000-0000-0000-000000000001',
  appKey: 'my-app',
  displayName: 'My app',
  description: 'An application served by the Fusion portal.',
  type: 'standalone',
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
        new Response(JSON.stringify(VALID_APP), {
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
    const app = await getApp('v1', client, 'json')({ appIdentifier: 'my-app' });

    expect(app).toMatchObject(VALID_APP);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('derives the selected method result from the app response schema', () => {
    expectTypeOf(getApp('v1', client)({ appIdentifier: 'my-app' })).toEqualTypeOf<
      Promise<ApiAppV1>
    >();
    expectTypeOf(getApp('v1', client, 'json$')({ appIdentifier: 'my-app' })).toEqualTypeOf<
      StreamResponse<ApiAppV1>
    >();
  });

  it("defaults to the 'json' method when none is supplied", async () => {
    await expect(getApp('v1', client)({ appIdentifier: 'my-app' })).resolves.toMatchObject(
      VALID_APP,
    );
  });

  it("emits a validated payload when the 'json$' method is selected", async () => {
    const stream = getApp('v1', client, 'json$')({ appIdentifier: 'my-app' });

    expect(stream).toHaveProperty('subscribe');
    await expect(firstEmission(stream)).resolves.toMatchObject(VALID_APP);
  });

  it('defers the request until an observable result is subscribed to', async () => {
    const stream = listApps('v1', client, 'json$')({ search: 'my' });

    expect(fetchMock).not.toHaveBeenCalled();

    // A page envelope is required by the collection schema, so the stub is narrowed here.
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ totalCount: 1, value: [VALID_APP] }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(firstEmission(stream)).resolves.toMatchObject({ value: [VALID_APP] });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects a payload the version 1.0 response schema does not allow', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ appKey: 42 }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(getApp('v1', client)({ appIdentifier: 'my-app' })).rejects.toThrowError();
  });

  it('requests the version 1.0 path from the configured base URI', async () => {
    await getApp('v1', client)({ appIdentifier: 'my-app' });

    const [request] = fetchMock.mock.calls.at(-1) as [string];

    expect(String(request)).toBe(`${BASE_URL}/apps/my-app?api-version=1.0`);
  });

  it('sends the mutation verb and the request body a mutating operation declares', async () => {
    await updateApp('v1', client)({ appIdentifier: 'my-app', displayName: 'Renamed app' });

    const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];

    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ displayName: 'Renamed app' });
  });

  it('resolves without a body for an operation that answers an empty success', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(resetAppsCache('v1', client)()).resolves.toBeUndefined();
  });

  it('reads bundle content as a blob instead of parsing it as JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('console.log("app");', {
        headers: {
          'content-type': 'application/javascript',
          'content-disposition': 'attachment; filename=app-bundle.js',
        },
      }),
    );

    const bundle = await getAppBundleArchive(
      'v1',
      client,
    )({
      appIdentifier: 'my-app',
      versionIdentifier: '1.2.3',
    });

    expect(bundle.filename).toBe('app-bundle.js');
    await expect(bundle.blob.text()).resolves.toBe('console.log("app");');
  });
});
