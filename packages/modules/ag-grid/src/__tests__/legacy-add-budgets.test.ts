import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';

import { AgGridProvider } from '../AgGridProvider.js';

/**
 * Workload overhead gates hold only on a documented, otherwise idle machine; shared CI runners
 * measure contention instead. Set `TELEMETRY_BUDGETS=1` to enforce them, as for the foundation.
 */
const measureWorkloadBudgets = process.env.TELEMETRY_BUDGETS === '1';

const CALLS = 1000;
const RUNS = 30;
const WARMUP = 5;

afterEach(() => vi.unstubAllGlobals());

/** Selects p95 from measured samples without averaging away slow runs. */
function p95(samples: number[]): number {
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];
}

/** Mounts {@link CALLS} grids through the patched legacy `add()` and returns the duration. */
async function mountGrids(capture: boolean, trackEvent: () => void): Promise<number> {
  const grids = new Map<unknown, unknown>();
  vi.stubGlobal('window', { agStyleInjectionState: { grids } });
  // Only the members used by the AG Grid diagnostic are faked.
  const telemetry = { source: { hostId: 'budget' }, trackEvent } as unknown as ITelemetryProvider;
  const provider = new AgGridProvider({});
  await provider.connectTelemetry(capture ? telemetry : undefined);
  const add = (grids as Map<unknown, unknown> & { add: (key: unknown) => void }).add;
  const start = performance.now();
  // Each call stands for one legacy grid registering its style injection.
  for (let index = 0; index < CALLS; index++) add(index);
  const duration = performance.now() - start;
  provider.dispose();
  return duration;
}

describe('AG Grid legacy add() telemetry budgets', () => {
  it('emits one record per host for repeated legacy usage within the workload gate', async () => {
    const trackEvent = vi.fn();
    const base: number[] = [];
    const measured: number[] = [];
    // Paired warm-up and measured runs with only telemetry capture toggled.
    for (let run = 0; run < WARMUP + RUNS; run++) {
      const off = await mountGrids(false, trackEvent);
      const on = await mountGrids(true, trackEvent);
      // Warm-up runs are discarded.
      if (run >= WARMUP) {
        base.push(off);
        measured.push(on);
      }
    }

    // One record per connected host lifecycle, regardless of 1000 add() calls each.
    expect(trackEvent).toHaveBeenCalledTimes(WARMUP + RUNS);
    // Gate only on documented environments; always report the measurement.
    if (measureWorkloadBudgets) {
      expect(p95(measured) - p95(base)).toBeLessThanOrEqual(Math.max(5, p95(base) * 0.05));
    }
    console.info(
      `AG Grid ${CALLS} add() p95 off=${p95(base).toFixed(3)}ms on=${p95(measured).toFixed(3)}ms`,
    );
  });
});
