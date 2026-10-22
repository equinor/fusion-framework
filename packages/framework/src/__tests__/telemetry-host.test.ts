import { describe, expect, it, vi } from 'vitest';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { mockFramework } from '../mock/mock-framework.js';

describe('framework host telemetry', () => {
  it('captures one host origin and terminal initialization/disposal without implicit exporters', async () => {
    const processItem = vi.fn();
    const fusion = await mockFramework((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('test', { initialize: vi.fn(), processItem });
        },
      });
    });
    const initialized = processItem.mock.calls.filter(
      ([item]) => item.name === 'fusion.host.initialize.duration',
    );
    expect(initialized).toHaveLength(1);
    expect(initialized[0][0].diagnostic).toMatchObject({
      source: 'framework',
      hostId: expect.any(String),
    });
    await fusion.modules.dispose();
    const disposed = processItem.mock.calls.filter(
      ([item]) => item.name === 'fusion.host.dispose.duration',
    );
    expect(disposed).toHaveLength(1);
    expect(disposed[0][0].diagnostic.hostId).toBe(initialized[0][0].diagnostic.hostId);
  });
});
