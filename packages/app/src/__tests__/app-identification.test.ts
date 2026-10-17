import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import { AppConfiguratorError } from '../AppConfiguratorError.js';
import {
  appIdentificationHeaders,
  applyAppIdentificationOptions,
  createAppIdentificationOperator,
  toOrigin,
} from '../app-identification/index.js';
import type { AppMockConfigurator } from '../mock/AppMockConfigurator.js';
import { mockAppModules } from '../mock/mock-app-modules.js';
import { version } from '../version.js';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
    build: {
      version: '1.2.3',
      entryPoint: 'index.js',
    },
  },
};

const serviceUrl = 'https://context.fusion.test/items';
const externalUrl = 'https://external.example.test/items';

/**
 * Registers clients for a Fusion service and an external API, and records the headers each
 * outgoing request carries after the request handler pipeline has run.
 */
const setupClients = (configurator: AppMockConfigurator, captured: Map<string, Headers>): void => {
  configurator.useFrameworkServiceClient('context');
  configurator.configureHttpClient('external', { baseUri: 'https://external.example.test' });
  configurator.http.addMiddleware(async (uri, init) => {
    captured.set(uri, new Headers(init.headers));
    return Response.json({});
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('app identification headers', () => {
  it('identifies the app on requests to Fusion services', async () => {
    const captured = new Map<string, Headers>();
    const modules = await mockAppModules((c) => setupClients(c, captured), env);

    await modules.http.createClient('context').json('/items');

    const headers = captured.get(serviceUrl);
    expect(headers?.get(appIdentificationHeaders.app)).toBe('test-app');
    expect(headers?.get(appIdentificationHeaders.appVersion)).toBe('1.2.3');
    expect(headers?.get(appIdentificationHeaders.frameworkVersion)).toBe(version);
  });

  it('leaves requests to origins that are not allowed untouched', async () => {
    const captured = new Map<string, Headers>();
    const modules = await mockAppModules((c) => setupClients(c, captured), env);

    await modules.http.createClient('external').json('/items');

    const headers = captured.get(externalUrl);
    expect(headers).toBeDefined();
    expect(headers?.has(appIdentificationHeaders.app)).toBe(false);
    expect(headers?.has(appIdentificationHeaders.appVersion)).toBe(false);
    expect(headers?.has(appIdentificationHeaders.frameworkVersion)).toBe(false);
  });

  it('identifies the app on requests to origins the app opted in', async () => {
    const captured = new Map<string, Headers>();
    const modules = await mockAppModules((c) => {
      setupClients(c, captured);
      c.configureAppIdentification({ allowedOrigins: ['https://external.example.test/api'] });
    }, env);

    await modules.http.createClient('external').json('/items');

    expect(captured.get(externalUrl)?.get(appIdentificationHeaders.app)).toBe('test-app');
  });

  it('sends no identification headers when disabled', async () => {
    const captured = new Map<string, Headers>();
    const modules = await mockAppModules((c) => {
      setupClients(c, captured);
      c.configureAppIdentification({ enabled: false });
    }, env);

    await modules.http.createClient('context').json('/items');

    expect(captured.get(serviceUrl)?.has(appIdentificationHeaders.app)).toBe(false);
  });

  it('keeps identification headers set explicitly on the request', async () => {
    const captured = new Map<string, Headers>();
    const modules = await mockAppModules((c) => setupClients(c, captured), env);

    await modules.http
      .createClient('context')
      .json('/items', { headers: { [appIdentificationHeaders.app]: 'override' } });

    expect(captured.get(serviceUrl)?.get(appIdentificationHeaders.app)).toBe('override');
  });

  it('still starts the app and tags opted-in origins when service discovery fails', async () => {
    const fusion = await mockFramework();
    vi.spyOn(fusion.modules.serviceDiscovery, 'resolveServices').mockRejectedValue(
      new Error('discovery unavailable'),
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const captured = new Map<string, Headers>();

    const modules = await mockAppModules(
      (c) => {
        c.configureHttpClient('external', { baseUri: 'https://external.example.test' });
        c.configureAppIdentification({ allowedOrigins: ['https://external.example.test'] });
        c.http.addMiddleware(async (uri, init) => {
          captured.set(uri, new Headers(init.headers));
          return Response.json({});
        });
      },
      env,
      fusion,
    );
    await modules.http.createClient('external').json('/items');

    expect(warn).toHaveBeenCalled();
    expect(captured.get(externalUrl)?.get(appIdentificationHeaders.app)).toBe('test-app');
  });

  it('rejects an allowed origin that is not an absolute URL', async () => {
    await expect(
      mockAppModules((c) => c.configureAppIdentification({ allowedOrigins: ['not a url'] }), env),
    ).rejects.toBeInstanceOf(AppConfiguratorError);
  });
});

describe('createAppIdentificationOperator', () => {
  const request = (uri: string, headers?: HeadersInit): FetchRequest => ({
    uri,
    path: '/',
    headers,
  });

  it('omits the version headers when the identity has no versions', async () => {
    const operator = createAppIdentificationOperator(
      { appKey: 'my-app' },
      new Set(['https://api.example.test']),
    );

    const result = await operator(request('https://api.example.test/x'));
    const headers = new Headers(result ? result.headers : undefined);

    expect(headers.get(appIdentificationHeaders.app)).toBe('my-app');
    expect(headers.has(appIdentificationHeaders.appVersion)).toBe(false);
    expect(headers.has(appIdentificationHeaders.frameworkVersion)).toBe(false);
  });

  it('ignores requests whose URI cannot be parsed', async () => {
    const operator = createAppIdentificationOperator({ appKey: 'my-app' }, new Set());

    expect(await operator(request('not a url'))).toBeUndefined();
  });
});

describe('applyAppIdentificationOptions', () => {
  it('accumulates normalized origins and keeps enabled unless set explicitly', () => {
    const first = applyAppIdentificationOptions(
      { enabled: false, allowedOrigins: new Set() },
      { allowedOrigins: ['https://a.example.test/api'] },
    );
    const second = applyAppIdentificationOptions(first, {
      allowedOrigins: ['https://b.example.test'],
    });

    expect(second.enabled).toBe(false);
    expect([...second.allowedOrigins]).toEqual([
      'https://a.example.test',
      'https://b.example.test',
    ]);
  });
});

describe('toOrigin', () => {
  it('resolves relative URIs against the base', () => {
    expect(toOrigin('/@fusion-api/context', 'http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('returns undefined for values that are not URLs', () => {
    expect(toOrigin('not a url')).toBeUndefined();
  });
});
