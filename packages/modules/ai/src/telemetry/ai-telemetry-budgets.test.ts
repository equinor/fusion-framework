import { describe, expect, it } from 'vitest';
import { from, type Observable } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableTelemetry, type TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

import { BaseService } from '../lib/BaseService.js';
import { STRATEGY_TYPE } from '../lib/strategies/static.js';
import type { IModel } from '../lib/types.js';
import { AiProvider } from '../AiProvider.js';

/**
 * Workload overhead gates hold only on a documented, otherwise idle machine; shared CI runners
 * measure contention instead. Set `TELEMETRY_BUDGETS=1` to enforce them, as for the foundation.
 */
const measureWorkloadBudgets = process.env.TELEMETRY_BUDGETS === '1';

const CHUNKS = 500;
const RUNS = 30;
const WARMUP = 5;

/** Streaming model emitting a fixed number of chunks per execution. */
class ChunkModel extends BaseService<string, string> {
  /** Placeholder for the `IModel.llm` contract. */
  readonly llm = {};
  /** @returns {@link CHUNKS} synchronous chunks. */
  invoke$(): Observable<string> {
    return from(Array.from({ length: CHUNKS }, () => 'token'));
  }
}

/** Selects p95 from measured samples without averaging away slow runs. */
function p95(samples: number[]): number {
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];
}

/** Creates a configured host whose AI client is instrumented only when `capture` is set. */
async function createModel(
  capture: boolean,
): Promise<{ model: IModel; records: () => number; dispose: () => Promise<void> }> {
  let records = 0;
  const config = new ModulesConfigurator();
  enableTelemetry(config, {
    attachConfiguratorEvents: false,
    configure: (builder) => {
      builder.setAdapter('count', {
        initialize: async () => {},
        processItem: () => {
          records++;
        },
      });
    },
  });
  const modules = await config.initialize<[TelemetryModule]>();
  // The chunk model implements the IModel surface measured here.
  const createChunkModel = (): IModel => new ChunkModel() as unknown as IModel;
  const provider = new AiProvider({
    strategies: [
      {
        name: 'budget',
        type: STRATEGY_TYPE.MODEL,
        createModel: createChunkModel,
      },
    ],
  } as never);
  await provider.connectTelemetry(capture ? modules.telemetry : undefined);
  return {
    model: provider.useModel('m', { strategy: 'budget' }),
    records: () => records,
    dispose: () => modules.dispose(),
  };
}

/** Consumes one full stream and returns its wall-clock duration. */
async function consume(model: IModel): Promise<number> {
  const start = performance.now();
  // Drain every chunk, as a chat UI rendering a streamed answer would.
  for await (const _chunk of await model.stream('q'));
  return performance.now() - start;
}

describe('AI telemetry volume and overhead budgets', () => {
  it('emits one record per streamed execution and stays within the workload gate', async () => {
    const baseline = await createModel(false);
    const instrumented = await createModel(true);
    const base: number[] = [];
    const measured: number[] = [];
    // Paired warm-up and measured runs with only telemetry capture toggled.
    for (let run = 0; run < WARMUP + RUNS; run++) {
      const off = await consume(baseline.model);
      const on = await consume(instrumented.model);
      // Warm-up runs are discarded.
      if (run >= WARMUP) {
        base.push(off);
        measured.push(on);
      }
    }

    // 500 chunks per stream, yet exactly one terminal metric per execution.
    expect(instrumented.records()).toBe(WARMUP + RUNS);
    expect(baseline.records()).toBe(0);
    await baseline.dispose();
    await instrumented.dispose();
    // Gate only on documented environments; always report the measurement.
    if (measureWorkloadBudgets) {
      const limit = Math.max(5, p95(base) * 0.05);
      expect(p95(measured) - p95(base)).toBeLessThanOrEqual(limit);
    }
    console.info(
      `AI stream p95 off=${p95(base).toFixed(3)}ms on=${p95(measured).toFixed(3)}ms (${CHUNKS} chunks)`,
    );
  });
});
