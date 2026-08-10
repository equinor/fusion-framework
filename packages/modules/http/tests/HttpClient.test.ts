import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lastValueFrom } from 'rxjs';

import { Errors, HttpClientProvider } from '../src';
import { HttpClientConfigurator } from '../src/configurator';
import { HttpClient, HttpClientMsal } from '../src/lib';
import { HttpResponseHandler } from '../src/lib/operators';

let provider: HttpClientProvider;

describe('HttpClient', () => {
  beforeEach(() => {
    const config = new HttpClientConfigurator(HttpClient);
    config.configureClient('foo', 'http://localhost:3000');
    provider = new HttpClientProvider(config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create instance', () => {
    const client = provider.createClient('foo');
    expect(client).toBeDefined();
    expect(client.uri).toBe('http://localhost:3000');
  });

  it('should allow providing headers in request', async () => {
    const client = provider.createClient('foo');
    client.requestHandler.setHeader('x-foo', 'bar');

    const request = await lastValueFrom(
      client.requestHandler.process({
        path: '/api',
        uri: client.uri,
        headers: { 'x-bar': 'baz' },
      }),
    );

    const headers = request.headers as Headers;
    expect(headers.get('x-foo')).toBe('bar');
    expect(headers.get('x-bar')).toBe('baz');
  });

  it('should not modify configured headers', async () => {
    const fooClient = provider.createClient('foo');
    fooClient.requestHandler.setHeader('x-foo', 'bar');

    const fooRequest = await lastValueFrom(
      fooClient.requestHandler.process({ path: '/api', uri: fooClient.uri }),
    );

    expect((fooRequest.headers as Headers)?.get('x-foo')).toBe('bar');

    const barClient = provider.createClient('foo');
    const barRequest = await lastValueFrom(
      barClient.requestHandler.process({ path: '/api', uri: barClient.uri }),
    );

    expect((barRequest.headers as Headers)?.get('x-foo')).toBeUndefined();
  });

  it('should execute configured response handlers from client options', async () => {
    const responseSpy = vi.fn();
    const config = new HttpClientConfigurator(HttpClient);

    config.configureClient('bar', {
      baseUri: 'http://localhost:3000',
      responseHandler: new HttpResponseHandler({
        'response-spy': responseSpy,
      }),
    });

    const localProvider = new HttpClientProvider(config);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));

    await localProvider.createClient('bar').fetch('/api');

    expect(responseSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit the original path on the request stream', async () => {
    const requestSpy = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));

    const client = provider.createClient('foo');
    const subscription = client.request$.subscribe(requestSpy);

    await client.fetch('/api');
    subscription.unsubscribe();

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api',
        uri: 'http://localhost:3000/api',
      }),
    );
  });

  it('should throw when a configured client cannot be found', () => {
    expect(() => provider.createClient('missing-client')).toThrowError(
      new Errors.ClientNotFoundException('No registered http client for key [missing-client]'),
    );
  });

  it('should treat a bare hostname as https:// URL with a warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const client = provider.createClient('api.example.com');
    expect(client.uri).toBe('https://api.example.com');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('missing the http:// or https:// protocol'),
    );
  });

  it('runs middleware registered through the configurator around every created client', async () => {
    const config = new HttpClientConfigurator(HttpClient);
    config.configureClient('foo', 'http://localhost:3000');
    config.addMiddleware(() => Response.json('from-middleware'));

    const client = new HttpClientProvider(config).createClient('foo');

    await expect(client.json('/api')).resolves.toBe('from-middleware');
  });

  it('lets middleware call next through to the real network call', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json('from-network'));

    const config = new HttpClientConfigurator(HttpClient);
    config.configureClient('foo', 'http://localhost:3000');
    config.addMiddleware((uri, init, next) => next(uri, init));

    const client = new HttpClientProvider(config).createClient('foo');

    await expect(client.json('/api')).resolves.toBe('from-network');
  });

  it('aborts the underlying fetch on abort(), even behind a pass-through middleware', async () => {
    // `next(...)` resolves through a Promise (`HttpMiddlewareHandler`'s `toPromise`), so this
    // asserts the fix doesn't rely on RxJS unsubscription reaching `_performFetch` through it.
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );

    const config = new HttpClientConfigurator(HttpClient);
    config.configureClient('foo', 'http://localhost:3000');
    config.addMiddleware((uri, init, next) => next(uri, init));

    const client = new HttpClientProvider(config).createClient('foo');
    const request = client.json('/api');
    // let the request reach `_performFetch` (and register the abort listener) before aborting
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    client.abort();

    await expect(request).rejects.toBeDefined();
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
});

describe('HttpClientMsal', () => {
  it('should not mutate the provided request init object', () => {
    const client = new HttpClientMsal('http://localhost:3000');
    client.defaultScopes = ['scope.default'];

    const init = { scopes: ['scope.request'] };

    client.fetch$('/api', init);

    expect(init).toStrictEqual({ scopes: ['scope.request'] });
  });
});
