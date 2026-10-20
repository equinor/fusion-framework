import { describe, expect, it } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableTelemetry } from '../enable-telemetry.js';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { createHttpTelemetry, type HttpTelemetry } from '../create-http-telemetry.js';
import type { TelemetryModule } from '../module.js';

/** Selects p95 from measured samples without averaging away slow runs. */
function p95(samples: number[]): number {
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];
}

/** Measures identical startup work with only lifecycle capture toggled. */
async function startup(
  capture: boolean,
): Promise<{ duration: number; count: number; disposed: number }> {
  const start = performance.now();
  const config = new ModulesConfigurator();
  let count = 0;
  enableTelemetry(config, {
    attachConfiguratorEvents: capture,
    configure: (builder) => {
      builder.setAdapter('count', {
        initialize: async () => {},
        processItem: () => {
          count++;
        },
      });
    },
  });
  for (let index = 0; index < 16; index++) {
    config.addConfig({
      module: {
        name: `test-${index}`,
        initialize: () => ({ version: '1.0.0' }),
        dispose: () => {},
      },
    });
  }
  const modules = await config.initialize<[TelemetryModule]>();
  // Include completion of asynchronous in-process enrichment, but not collector/network delay.
  await Promise.resolve();
  await Promise.resolve();
  const duration = performance.now() - start;
  const result = { duration, count };
  await modules.dispose();
  return { ...result, disposed: count - result.count };
}

describe('approved foundational measurement budgets', () => {
  it('bounds startup volume and measured p95 overhead across 30 paired runs', async () => {
    for (let index = 0; index < 5; index++) {
      await startup(false);
      await startup(true);
    }
    const baseline: number[] = [];
    const instrumented: number[] = [];
    for (let index = 0; index < 30; index++) {
      const off = await startup(false);
      const on = await startup(true);
      baseline.push(off.duration);
      instrumented.push(on.duration);
      expect(off.count).toBe(0);
      expect(on.count).toBe(18);
      expect(off.disposed).toBe(0);
      expect(on.disposed).toBe(17);
    }
    const baselineP95 = p95(baseline);
    const instrumentedP95 = p95(instrumented);
    console.info('Startup telemetry budget (ms)', { baselineP95, instrumentedP95 });
    expect(instrumentedP95 - baselineP95).toBeLessThanOrEqual(Math.max(5, baselineP95 * 0.05));
  });

  it('bounds runtime workload overhead and per-record cost without network latency', async () => {
    let count = 0;
    const provider = new TelemetryProvider({
      adapters: {
        count: {
          initialize: async () => {},
          processItem: () => {
            count++;
          },
        },
      },
    });
    await provider.initialize();
    const off: HttpTelemetry = {
      middleware: (uri, init, next) => next(uri, init),
      dispose: () => {},
    };
    const on = createHttpTelemetry(() => provider);
    const response = new Response();
    const next = async (): Promise<Response> => response;
    const baseline: number[] = [];
    const instrumented: number[] = [];
    const perRecord: number[] = [];
    for (let run = 0; run < 35; run++) {
      for (const [diagnostics, samples] of [
        [off, baseline],
        [on, instrumented],
      ] as const) {
        const started = performance.now();
        for (let index = 0; index < 100; index++) {
          const operationStart = performance.now();
          await diagnostics.middleware('/not-exported', {}, next);
          if (run >= 5 && diagnostics === on) perRecord.push(performance.now() - operationStart);
        }
        if (run >= 5) samples.push(performance.now() - started);
      }
    }
    const baselineP95 = p95(baseline);
    const instrumentedP95 = p95(instrumented);
    const perRecordP95 = p95(perRecord);
    console.info('Runtime telemetry budget (ms)', { baselineP95, instrumentedP95, perRecordP95 });
    expect(count).toBe(3_500);
    expect(perRecordP95).toBeLessThanOrEqual(0.5);
    expect(instrumentedP95 - baselineP95).toBeLessThanOrEqual(Math.max(5, baselineP95 * 0.05));
    off.dispose();
    on.dispose();
    await provider.dispose();
  });
});
