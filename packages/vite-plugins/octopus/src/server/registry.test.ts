import { describe, expect, it } from 'vitest';

import { parseLocalUrl, Registry } from './registry.js';
import { parseAppRequest } from './routes.js';

describe('Registry', () => {
  const createRegistry = () => {
    let now = 1000;
    const registry = new Registry(() => now);
    return { registry, advance: (ms: number) => (now += ms) };
  };

  it('registers apps and renews entries on heartbeat', () => {
    const { registry, advance } = createRegistry();

    const first = registry.register('fusion-help', {
      url: 'http://localhost:5007',
      instanceId: 'a',
    });
    advance(5000);
    const heartbeat = registry.register('fusion-help', {
      url: 'http://localhost:5007',
      instanceId: 'a',
    });

    expect(first.created).toBe(true);
    expect(heartbeat.created).toBe(false);
    expect(heartbeat.app).toMatchObject({ registeredAt: 1000, lastSeen: 6000 });
  });

  it('keeps the newest dev server active, whatever order heartbeats arrive in', () => {
    const { registry } = createRegistry();
    registry.register('fusion-help', { url: 'http://localhost:5007', instanceId: 'a' });

    const { replaced } = registry.register('fusion-help', {
      url: 'http://localhost:5100',
      instanceId: 'b',
    });
    const heartbeat = registry.register('fusion-help', {
      url: 'http://localhost:5007',
      instanceId: 'a',
    });

    expect(replaced?.url).toBe('http://localhost:5007');
    expect(heartbeat).toMatchObject({ created: false, replaced: undefined });
    expect(registry.get('fusion-help')?.url).toBe('http://localhost:5100');
    expect(registry.list()).toHaveLength(1);
    expect(registry.instances()).toHaveLength(2);
  });

  it('keeps the most recently started dev server active when they register in another order', () => {
    // E.g. after Octopus restarts, dev servers register again in the order their heartbeats arrive.
    const { registry } = createRegistry();
    registry.register('app-admin', {
      url: 'http://localhost:5001',
      mockUrl: 'http://localhost:4010',
      instanceId: 'mock',
      startedAt: 200,
    });

    const normal = registry.register('app-admin', {
      url: 'http://localhost:5002',
      instanceId: 'normal',
      startedAt: 100,
    });

    expect(normal).toMatchObject({ created: true, replaced: undefined });
    expect(registry.get('app-admin')?.instanceId).toBe('mock');
  });

  it('hands over to the next most recent dev server when the active one stops', () => {
    const { registry } = createRegistry();
    registry.register('fusion-help', { url: 'http://localhost:5007', instanceId: 'a' });
    registry.register('fusion-help', { url: 'http://localhost:5100', instanceId: 'b' });

    expect(registry.unregister('fusion-help', 'b')?.url).toBe('http://localhost:5100');
    expect(registry.get('fusion-help')?.url).toBe('http://localhost:5007');
    expect(registry.unregister('fusion-help', 'c')).toBeUndefined();
  });

  it('keeps the mock server of apps in mock mode', () => {
    const { registry } = createRegistry();

    const { app } = registry.register('app-admin', {
      url: 'http://localhost:5001',
      mockUrl: 'http://localhost:4010',
      instanceId: 'a',
    });

    expect(app.mockUrl).toBe('http://localhost:4010');
  });

  it('removes entries without a recent heartbeat', () => {
    const { registry, advance } = createRegistry();
    registry.register('fusion-help', { url: 'http://localhost:5007', instanceId: 'a' });
    advance(10_000);
    registry.register('app-admin', { url: 'http://localhost:5001', instanceId: 'b' });
    advance(6000);

    expect(registry.expire(15_000).map(({ appKey }) => appKey)).toEqual(['fusion-help']);
    expect(registry.list().map(({ appKey }) => appKey)).toEqual(['app-admin']);
  });

  it('blocks every dev server of an app unregistered by hand until they restart', () => {
    const { registry } = createRegistry();
    registry.register('fusion-help', { url: 'http://localhost:5007', instanceId: 'a' });
    registry.register('fusion-help', { url: 'http://localhost:5100', instanceId: 'b' });

    registry.block('fusion-help');

    expect(registry.get('fusion-help')).toBeUndefined();
    expect(registry.isBlocked('a')).toBe(true);
    expect(registry.isBlocked('b')).toBe(true);
    expect(registry.isBlocked('c')).toBe(false);
  });
});

describe('parseLocalUrl', () => {
  it.each(['http://localhost:5007', 'http://127.0.0.1:5007', 'http://[::1]:5007'])(
    'accepts %s',
    (url) => {
      expect(parseLocalUrl(url)?.origin).toBe(url);
    },
  );

  it.each(['https://localhost:5007', 'http://example.com', 'not a url', 42, undefined])(
    'rejects %j',
    (url) => {
      expect(parseLocalUrl(url)).toBeUndefined();
    },
  );
});

describe('parseAppRequest', () => {
  it.each([
    ['/persons/me/apps/fusion-help', { type: 'manifest', appKey: 'fusion-help' }],
    [
      '/apps/fusion-help/builds/1.5.11/config',
      { type: 'config', appKey: 'fusion-help', version: '1.5.11' },
    ],
    [
      '/apps/fusion-help/builds/2.0.0-beta.1+build.5/config',
      { type: 'config', appKey: 'fusion-help', version: '2.0.0-beta.1+build.5' },
    ],
    [
      '/bundles/apps/fusion-help@1.5.11//Users/me/src/index.ts',
      { type: 'bundle', appKey: 'fusion-help', path: 'Users/me/src/index.ts' },
    ],
    [
      '/bundles/apps/fusion-chat/0.1.2/Users/me/src/index.ts',
      { type: 'bundle', appKey: 'fusion-chat', path: 'Users/me/src/index.ts' },
    ],
  ])('recognises %s', (path, expected) => {
    expect(parseAppRequest(path)).toEqual(expected);
  });

  it.each([
    '/apps/fusion-help@pr-123',
    '/persons/me/apps/fusion-help/settings',
    '/apps/fusion-help/builds',
    '/persons/me/apps',
    // Encoded slashes or other characters in the version never reach the dev server.
    '/apps/fusion-help/builds/1.0.0%2F..%2F..%2Fsecret/config',
    '/apps/fusion-help/builds/1.0.0%3Fx/config',
  ])('leaves %s to CI', (path) => {
    expect(parseAppRequest(path)).toBeUndefined();
  });
});
