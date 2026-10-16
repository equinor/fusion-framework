import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RuntimeEnv } from './types.js';
import { InvalidDevServerConfigError } from './InvalidDevServerConfigError.js';
import { loadDevServerConfig } from './load-dev-server-config.js';

const tempDirs: string[] = [];

/**
 * Creates an isolated directory for a dev-server config fixture.
 *
 * @returns The temporary directory path.
 */
const createRoot = async (): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'dev-server-config-'));
  tempDirs.push(root);
  return root;
};

const base: DevServerOptions = {
  spa: {
    templateEnv: {
      title: 'Default title',
      portal: { id: 'default-portal' },
      serviceDiscovery: { url: '/default-discovery', scopes: [] },
      msal: { clientId: '', tenantId: '', redirectUri: '/', requiresAuth: 'true' },
      serviceWorker: { resources: [{ url: '/default-resource' }] },
    },
  },
  api: {
    serviceDiscoveryUrl: '/default-discovery',
  },
};

/**
 * Creates the runtime environment used to resolve a temporary config file.
 *
 * @param root - Directory containing the config fixture.
 * @returns A development-server runtime environment.
 */
const createEnv = (root: string): RuntimeEnv => ({
  command: 'serve',
  mode: 'development',
  root,
});

afterEach(async () => {
  // Remove each isolated config fixture after its test completes.
  await Promise.all(tempDirs.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('loadDevServerConfig', () => {
  it('merges and validates a JSON configuration over defaults', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ spa: { templateEnv: { msal: { requiresAuth: 'false' } } } }),
    );

    const loaded = await loadDevServerConfig(createEnv(root), base);
    const templateEnv = loaded.config.spa?.templateEnv;

    // JSON config fixtures are expected to resolve to a static template object.
    if (!templateEnv || typeof templateEnv === 'function') {
      throw new Error('Expected the merged template environment to be an object');
    }

    expect(templateEnv.msal?.requiresAuth).toBe('false');
    expect(templateEnv.msal?.clientId).toBeDefined();
    expect(templateEnv.serviceDiscovery?.url).toBe('/default-discovery');
    // Compare resource paths only so credentials and scopes are excluded from assertions.
    expect(templateEnv.serviceWorker?.resources.map(({ url }) => url)).toContain(
      '/default-resource',
    );
  });

  it('supports config factories and callback-valued settings', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.mjs'),
      [
        'export default (_env, { base }) => ({',
        '  api: { processServices: base.api.processServices ?? (() => ({ data: [], routes: [] })),',
        '    routes: [{ match: "/factory-route", middleware: (_req, _res, next) => next() }] },',
        '  spa: { templateEnv: () => ({ title: "Factory title" }) },',
        '});',
      ].join('\n'),
    );

    const loaded = await loadDevServerConfig(createEnv(root), base);

    expect(typeof loaded.config.api.processServices).toBe('function');
    expect(typeof loaded.config.spa?.templateEnv).toBe('function');
    // The route match verifies that factory-returned routes survive resolution.
    expect(loaded.config.api.routes?.map(({ match }) => match)).toContain('/factory-route');
  });

  it('preserves shared defaults when a config factory returns its base', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.mjs'),
      'export default (_env, { base }) => base;',
    );

    const loaded = await loadDevServerConfig(createEnv(root), base);
    const templateEnv = loaded.config.spa?.templateEnv;

    // Factory results can reuse default resource objects and should retain identity for deduplication.
    if (!templateEnv || typeof templateEnv === 'function') {
      throw new Error('Expected the merged template environment to be an object');
    }
    expect(templateEnv.serviceWorker?.resources).toHaveLength(1);
    expect(templateEnv.serviceWorker?.resources[0]?.url).toBe('/default-resource');
  });

  it('supports static script configuration objects', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.mjs'),
      'export default { api: { headers: { "X-Config-Source": "module" } } };',
    );

    const loaded = await loadDevServerConfig(createEnv(root), base);

    expect(loaded.config.api.headers).toEqual({ 'X-Config-Source': 'module' });
    expect(loaded.config.api.serviceDiscoveryUrl).toBe('/default-discovery');
  });

  it('preserves plugin-contributed root settings', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ mockServer: { enabled: true } }),
    );

    const loaded = await loadDevServerConfig(createEnv(root), base);

    expect(loaded.config).toHaveProperty('mockServer.enabled', true);
  });

  it('reports invalid field paths instead of returning the base configuration', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ api: { serviceDiscoveryUrl: 42 } }),
    );

    const result = loadDevServerConfig(createEnv(root), base);

    await expect(result).rejects.toThrow(/api\.serviceDiscoveryUrl/);
    await expect(result).rejects.toBeInstanceOf(InvalidDevServerConfigError);
    await expect(result).rejects.toThrow(/API service discovery URL must be a non-empty string/);
  });

  it('rejects null configuration roots with a root-path diagnostic', async () => {
    const root = await createRoot();
    await writeFile(join(root, 'dev-server.config.json'), 'null');

    await expect(loadDevServerConfig(createEnv(root), base)).rejects.toThrow('<root>');
  });

  it('rejects explicit null for non-nullable settings with a field-path diagnostic', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ api: { serviceDiscoveryUrl: null } }),
    );

    await expect(loadDevServerConfig(createEnv(root), base)).rejects.toThrow(
      /api\.serviceDiscoveryUrl/,
    );
  });

  it('rejects null route entries after merging with default routes', async () => {
    const root = await createRoot();
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ api: { routes: [null] } }),
    );
    const baseWithRoute: DevServerOptions = {
      ...base,
      api: {
        ...base.api,
        routes: [{ match: '/default-route', middleware: () => undefined }],
      },
    };

    await expect(loadDevServerConfig(createEnv(root), baseWithRoute)).rejects.toThrow(
      /api\.routes\.1/,
    );
  });

  it('rejects null results from config factories at the root path', async () => {
    const root = await createRoot();
    await writeFile(join(root, 'dev-server.config.mjs'), 'export default () => null;');

    await expect(loadDevServerConfig(createEnv(root), base)).rejects.toThrow('<root>');
  });
});
