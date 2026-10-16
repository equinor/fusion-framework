import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDevServer as mockCreateDevServer,
  type DevServerOptions,
} from '@equinor/fusion-framework-dev-server';

const devServerConfigOverride = vi.hoisted(() => ({
  current: undefined as ((base: DevServerOptions) => DevServerOptions) | undefined,
  error: undefined as Error | undefined,
  load: undefined as
    | ((base: DevServerOptions) => Promise<{ config: DevServerOptions; path: string }>)
    | undefined,
}));

vi.mock('@equinor/fusion-framework-cli/lib', () => ({
  loadDevServerConfig: vi.fn(async (_env: unknown, base: DevServerOptions) => {
    // Simulate an invalid loaded config so startup fallback behavior is observable.
    if (devServerConfigOverride.error) {
      throw devServerConfigOverride.error;
    }
    // Delegate to the real loader only in integration cases that exercise startup validation.
    if (devServerConfigOverride.load) {
      return devServerConfigOverride.load(base);
    }
    return {
      config: devServerConfigOverride.current?.(base) ?? base,
      path: '/app/dev-server.config.ts',
    };
  }),
}));

vi.mock('@equinor/fusion-framework-dev-server', () => ({
  createDevServer: vi.fn(async () => ({ listen: vi.fn() })),
  processServices: vi.fn((data: unknown) => ({ data, routes: [] })),
}));

import { createDevServer } from './create-dev-server.js';
import { InvalidDevServerConfigError } from '../../lib/InvalidDevServerConfigError.js';
import { loadDevServerConfig as loadDevServerConfigActual } from '../../lib/load-dev-server-config.js';
import type { ConsoleLogger } from './ConsoleLogger.js';

describe('createDevServer mock mode', () => {
  const env = { mode: 'development', command: 'serve' as const, root: '/app' };
  const tempDirs: string[] = [];

  beforeEach(() => {
    devServerConfigOverride.current = undefined;
    devServerConfigOverride.error = undefined;
    devServerConfigOverride.load = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(async () => {
    // Remove each isolated config fixture after its startup test completes.
    await Promise.all(tempDirs.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  it('starts when mock discovery points at the mock server', async () => {
    await expect(createDevServer(env, { mock: 'http://localhost:4010' })).resolves.toBeDefined();
  });

  it('refuses to start when dev-server.config sends mock-mode discovery upstream', async () => {
    devServerConfigOverride.current = (base) => ({
      ...base,
      api: {
        ...base.api,
        serviceDiscoveryUrl:
          'https://discovery.fusion.equinor.com/service-registry/environments/ci/services/',
      },
    });

    await expect(createDevServer(env, { mock: 'http://localhost:4010' })).rejects.toThrow(
      /Mock mode is enabled/,
    );
  });

  it('allows real discovery when mock auth is off', async () => {
    devServerConfigOverride.current = (base) => ({
      ...base,
      api: { ...base.api, serviceDiscoveryUrl: 'https://discovery.example.com/services' },
    });

    await expect(createDevServer(env, {})).resolves.toBeDefined();
  });

  it('does not start with defaults when loaded configuration validation fails', async () => {
    // This test double implements only the logger methods exercised by createDevServer.
    const logger = {
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as ConsoleLogger;
    devServerConfigOverride.error = new InvalidDevServerConfigError([
      'api.serviceDiscoveryUrl: expected string',
    ]);

    await expect(createDevServer(env, {}, { log: logger })).rejects.toThrow(
      /api\.serviceDiscoveryUrl/,
    );
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('api.serviceDiscoveryUrl'));
  });

  it('rejects malformed routes during startup instead of falling back to defaults', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dev-server-startup-config-'));
    tempDirs.push(root);
    await writeFile(
      join(root, 'dev-server.config.json'),
      JSON.stringify({ api: { routes: [null] } }),
    );
    const testEnv = { ...env, root };
    const baseWithRoute: DevServerOptions = {
      api: {
        serviceDiscoveryUrl: '/default-discovery',
        routes: [{ match: '/default-route', middleware: () => undefined }],
      },
    };
    devServerConfigOverride.load = () => loadDevServerConfigActual(testEnv, baseWithRoute);

    await expect(createDevServer(testEnv, {})).rejects.toThrow(/api\.routes\.1/);
    expect(mockCreateDevServer).not.toHaveBeenCalled();
  });

  it('starts with defaults when no dev-server.config exists', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dev-server-startup-config-'));
    tempDirs.push(root);
    const testEnv = { ...env, root };
    devServerConfigOverride.load = (base) => loadDevServerConfigActual(testEnv, base);

    await expect(createDevServer(testEnv, {})).resolves.toBeDefined();
    expect(mockCreateDevServer).toHaveBeenCalledOnce();
  });

  it('refuses to start when dev-server.config cannot be parsed', async () => {
    // This test double implements only the logger methods exercised by createDevServer.
    const logger = { debug: vi.fn(), error: vi.fn() } as unknown as ConsoleLogger;
    const root = await mkdtemp(join(tmpdir(), 'dev-server-startup-config-'));
    tempDirs.push(root);
    await writeFile(join(root, 'dev-server.config.json'), '{ "api": ');
    const testEnv = { ...env, root };
    devServerConfigOverride.load = (base) => loadDevServerConfigActual(testEnv, base);

    await expect(createDevServer(testEnv, {}, { log: logger })).rejects.toThrow(
      /Failed to parse JSON/,
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load dev server config'),
    );
    expect(mockCreateDevServer).not.toHaveBeenCalled();
  });

  it('refuses to start when a config factory throws', async () => {
    devServerConfigOverride.error = new Error('factory failed');

    await expect(createDevServer(env, {})).rejects.toThrow(/factory failed/);
    expect(mockCreateDevServer).not.toHaveBeenCalled();
  });
});
