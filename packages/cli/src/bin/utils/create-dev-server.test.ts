import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

const devServerConfigOverride = vi.hoisted(() => ({
  current: undefined as ((base: DevServerOptions) => DevServerOptions) | undefined,
  error: undefined as Error | undefined,
}));

vi.mock('@equinor/fusion-framework-cli/lib', () => ({
  loadDevServerConfig: vi.fn(async (_env: unknown, base: DevServerOptions) => {
    // Simulate an invalid loaded config so startup fallback behavior is observable.
    if (devServerConfigOverride.error) {
      throw devServerConfigOverride.error;
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
import type { ConsoleLogger } from './ConsoleLogger.js';

describe('createDevServer mock mode', () => {
  const env = { mode: 'development', command: 'serve' as const, root: '/app' };

  beforeEach(() => {
    devServerConfigOverride.current = undefined;
    devServerConfigOverride.error = undefined;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
});
