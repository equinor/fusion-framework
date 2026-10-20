import { describe, expect, it, vi } from 'vitest';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { AppConfig } from '@equinor/fusion-framework-module-app';
import { mockAppModules } from '../mock/mock-app-modules.js';

const env = {
  manifest: {
    appKey: 'telemetry-app',
    displayName: 'Telemetry App',
    description: '',
    type: 'standalone' as const,
    build: { version: '1.0.0', entryPoint: 'index.js' },
  },
  config: new AppConfig({}),
};

describe('app host telemetry', () => {
  it('routes real app lifecycle records to inherited fallback with originating identity', async () => {
    const processItem = vi.fn();
    const fusion = await mockFramework((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('fallback', { fallback: true, initialize: vi.fn(), processItem });
        },
      });
    });
    processItem.mockClear();
    const app = await mockAppModules(undefined, env, fusion);
    await vi.waitFor(() =>
      expect(processItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'fusion.host.initialize.duration',
          diagnostic: expect.objectContaining({ source: 'app', appKey: 'telemetry-app' }),
        }),
      ),
    );
    await app.dispose();
    await fusion.modules.dispose();
  });

  it('reports a configuration callback failure without replacing it or duplicating fallback delivery', async () => {
    const processItem = vi.fn();
    const fusion = await mockFramework((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('fallback', { fallback: true, initialize: vi.fn(), processItem });
        },
      });
    });
    processItem.mockClear();
    const original = new Error('private-token-sentinel');
    await expect(
      mockAppModules(
        () => {
          throw original;
        },
        env,
        fusion,
      ),
    ).rejects.toBe(original);
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledTimes(2));
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('private-token-sentinel');
    await fusion.modules.dispose();
  });
});
