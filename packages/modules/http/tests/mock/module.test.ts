import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as httpModule } from '../../src/module';
import { HttpMockConfigurator } from '../../src/mock/HttpMockConfigurator';
import { enableHttpMock, httpMockModule } from '../../src/mock/module';

/** Initializes the mock module through the real module system, rather than hand-building a provider. */
const initializeMockWith = async (
  configure?: (builder: HttpMockConfigurator) => void,
): Promise<{ createClient: (key: string) => { json<T>(path: string): Promise<T> } }> => {
  const configurator = new ModulesConfigurator([]);
  enableHttpMock(configurator, configure);
  const instances = await configurator.initialize();
  // `initialize()` returns instances keyed by module name with no static type for
  // application modules; only the `http` client shape this test actually calls is asserted
  return (
    instances as unknown as {
      http: { createClient: (key: string) => { json<T>(path: string): Promise<T> } };
    }
  ).http;
};

describe('httpMockModule', () => {
  it('matches the real module name and initialize path', () => {
    expect(httpMockModule.name).toBe(httpModule.name);
    expect(httpMockModule.initialize).toBe(httpModule.initialize);
  });

  it('builds an HttpMockConfigurator', async () => {
    const configurator = await httpMockModule.configure?.();

    expect(configurator).toBeInstanceOf(HttpMockConfigurator);
  });
});

describe('enableHttpMock', () => {
  it('answers a configured client from a registered handler, resolved through the module system', async () => {
    const http = await initializeMockWith((builder) => {
      builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
      builder.get('/items', () => Response.json([{ id: 1 }]));
    });

    await expect(http.createClient('catalog').json('/items')).resolves.toEqual([{ id: 1 }]);
  });

  it('replaces an already registered http module', async () => {
    const configurator = new ModulesConfigurator([httpModule]);
    enableHttpMock(configurator, (builder) => {
      builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
      builder.get('/items', () => Response.json('mocked'));
    });

    // same untyped-instances reason as `initializeMockWith` above
    const instances = (await configurator.initialize()) as unknown as {
      http: { createClient: (key: string) => { json<T>(path: string): Promise<T> } };
    };

    await expect(instances.http.createClient('catalog').json('/items')).resolves.toBe('mocked');
  });
});

describe('vi.fn overrides', () => {
  it('lets a handler be a vi.fn spy, asserting it was called', async () => {
    const handler = vi.fn(() => Response.json('spied'));
    const http = await initializeMockWith((builder) => {
      builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
      builder.get('/items', handler);
    });

    await expect(http.createClient('catalog').json('/items')).resolves.toBe('spied');
    expect(handler).toHaveBeenCalledOnce();
  });
});
