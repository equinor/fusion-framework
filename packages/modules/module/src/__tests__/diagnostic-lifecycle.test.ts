import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../lib/configurator/ModulesConfigurator.js';
import { diagnosticExclusion } from '../diagnostic-exclusion.js';
import { excludeDiagnostics } from '../exclude-diagnostics.js';

describe('diagnostic lifecycle ownership', () => {
  it('cleans up early and late successful providers after another initializer fails', async () => {
    const config = new ModulesConfigurator();
    const early = vi.fn();
    const late = vi.fn();
    const failure = new Error('original');
    config.addConfig({ module: { name: 'early', initialize: () => ({}), dispose: early } });
    config.addConfig({
      module: {
        name: 'late',
        initialize: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return {};
        },
        dispose: late,
      },
    });
    config.addConfig({
      module: {
        name: 'broken',
        initialize: async () => {
          await Promise.resolve();
          throw failure;
        },
      },
    });
    await expect(config.initialize()).rejects.toBe(failure);
    expect(early).toHaveBeenCalledTimes(1);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('keeps diagnostic sinks live until business teardown and waits for all groups', async () => {
    const order: string[] = [];
    const config = new ModulesConfigurator();
    for (const [name, priority] of [
      ['event', 2],
      ['telemetry', 1],
      ['business', 0],
    ] as const) {
      config.addConfig({
        module: {
          name,
          disposePriority: priority,
          initialize: () => ({}),
          dispose: async () => {
            await Promise.resolve();
            order.push(name);
          },
        },
      });
    }
    const modules = await config.initialize();
    const first = modules.dispose();
    expect(modules.dispose()).toBe(first);
    await first;
    expect(order).toEqual(['business', 'telemetry', 'event']);
  });

  it('marks only the exporter request and retains the marker through option copies', () => {
    const original = { method: 'POST', body: 'payload' };
    const marked = excludeDiagnostics(original);
    expect(diagnosticExclusion in original).toBe(false);
    expect({ ...marked }[diagnosticExclusion]).toBe(true);
    expect(JSON.stringify(marked)).toBe(JSON.stringify(original));
  });
});
