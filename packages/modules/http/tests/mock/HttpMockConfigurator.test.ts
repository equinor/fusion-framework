import { describe, expect, it } from 'vitest';

import { HttpClientProvider } from '../../src/provider';
import { HttpMockConfigurator } from '../../src/mock/HttpMockConfigurator';

describe('HttpMockConfigurator', () => {
  it('answers a configured client from a registered handler instead of the network', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.configureClient('catalog', { baseUri: 'https://api.example.com' });
    configurator.get('/items', () => Response.json([{ id: 1 }]));

    const provider = new HttpClientProvider(configurator);
    const client = provider.createClient('catalog');

    await expect(client.json('/items')).resolves.toEqual([{ id: 1 }]);
  });

  it('shares one router across every client it builds', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.configureClient('a', { baseUri: 'https://a.example.com' });
    configurator.configureClient('b', { baseUri: 'https://b.example.com' });
    configurator.get('/ping', () => Response.json('pong'));

    const provider = new HttpClientProvider(configurator);

    await expect(provider.createClient('a').json('/ping')).resolves.toBe('pong');
    await expect(provider.createClient('b').json('/ping')).resolves.toBe('pong');
  });

  it('resolves an ad-hoc client (no configureClient call) against the same router', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.get('/ping', () => Response.json('pong'));

    const provider = new HttpClientProvider(configurator);
    const client = provider.createClient('https://example.com');

    await expect(client.json('/ping')).resolves.toBe('pong');
  });

  it('supports .use for a whole-request middleware, alongside .get/.post/...', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.configureClient('catalog', { baseUri: 'https://api.example.com' });
    configurator.use((request) =>
      request.url.includes('/special') ? Response.json('from-use') : undefined,
    );
    configurator.get('/items', () => Response.json('from-get'));

    const provider = new HttpClientProvider(configurator);
    const client = provider.createClient('catalog');

    await expect(client.json('/special')).resolves.toBe('from-use');
    await expect(client.json('/items')).resolves.toBe('from-get');
  });

  it('throws once no registered handler matches, naming the method and URL', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.configureClient('catalog', { baseUri: 'https://api.example.com' });

    const provider = new HttpClientProvider(configurator);
    const client = provider.createClient('catalog');

    await expect(client.json('/missing')).rejects.toThrow(/No mock handler matched/);
  });

  it('drops every registered handler after resetHandlers()', async () => {
    const configurator = new HttpMockConfigurator();
    configurator.configureClient('catalog', { baseUri: 'https://api.example.com' });
    configurator.get('/items', () => Response.json('ok'));

    configurator.resetHandlers();

    const provider = new HttpClientProvider(configurator);
    const client = provider.createClient('catalog');

    await expect(client.json('/items')).rejects.toThrow(/No mock handler matched/);
  });
});
