import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelemetryProviderState } from '../TelemetryProviderState.js';
import { telemetryProviderActions as actions } from '../TelemetryProviderState.actions.js';
import { createTelemetryProviderReducer } from '../TelemetryProviderState.reducer.js';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Creates an engine whose public owner only needs to validate startup records. */
function createEngine(
  config: ConstructorParameters<typeof TelemetryProviderState>[0]['config'] = {},
): TelemetryProviderState {
  const owner = { track: vi.fn() } as unknown as ITelemetryProvider;
  return new TelemetryProviderState({ config, owner });
}

describe('telemetry provider reducer', () => {
  it('moves through the lifecycle and keeps disposal authoritative over late readiness', () => {
    const reducer = createTelemetryProviderReducer();
    const initialization = Promise.resolve();
    const disposal = Promise.resolve();
    let state = reducer.getInitialState();
    expect(state.status).toBe('idle');
    state = reducer(state, actions.initialize(undefined, initialization));
    expect(state).toMatchObject({ status: 'initializing', initialization });
    state = reducer(state, actions.dispose(disposal));
    state = reducer(state, actions.initialize.success());
    expect(state).toMatchObject({ status: 'disposing', disposal });
    state = reducer(state, actions.close());
    expect(state.status).toBe('disposed');
  });

  it('retains the first failure and counts repeats by message', () => {
    const reducer = createTelemetryProviderReducer();
    const first = new Error('Telemetry parent relay failed');
    let state = reducer(reducer.getInitialState(), actions.failed(first));
    state = reducer(state, actions.failed(new Error('Telemetry parent relay failed')));
    expect(state.failures['Telemetry parent relay failed']).toEqual({ error: first, count: 2 });
  });

  it('tracks built-in enrichment and per-adapter processing until drained', () => {
    const reducer = createTelemetryProviderReducer();
    let state = reducer.getInitialState();
    for (const action of [
      actions.enrichmentStarted(true),
      actions.enrichmentStarted(false),
      actions.processingStarted('otlp'),
    ]) {
      state = reducer(state, action);
    }
    expect(state.enrichment).toEqual({ pending: 2, builtIn: 1 });
    expect(state.processing).toEqual({ otlp: 1 });
    for (const action of [
      actions.enrichmentSettled(true),
      actions.enrichmentSettled(false),
      actions.processingSettled('otlp'),
    ]) {
      state = reducer(state, action);
    }
    expect(state.enrichment).toEqual({ pending: 0, builtIn: 0 });
    expect(state.processing).toEqual({ otlp: 0 });
  });
});

describe('telemetry provider engine flows', () => {
  it('joins repeated initialization and disposal and settles them through flows', async () => {
    const shutdown = vi.fn();
    const engine = createEngine({
      adapters: { test: { initialize: vi.fn(), processItem: vi.fn(), shutdown } },
    });
    const initialization = engine.initialize();
    expect(engine.initialize()).toBe(initialization);
    await initialization;
    expect(engine.value.status).toBe('ready');
    const disposal = engine.dispose();
    expect(engine.dispose()).toBe(disposal);
    await disposal;
    expect(engine.value.status).toBe('disposed');
    expect(shutdown).toHaveBeenCalledOnce();
    await expect(engine.initialize()).rejects.toThrow('disposed');
  });

  it('rejects disposal with every exporter shutdown failure after attempting all of them', async () => {
    const healthy = vi.fn();
    const engine = createEngine({
      adapters: {
        broken: {
          initialize: vi.fn(),
          processItem: vi.fn(),
          shutdown: () => Promise.reject(new Error('offline')),
        },
        healthy: { initialize: vi.fn(), processItem: vi.fn(), shutdown: healthy },
      },
    });
    await engine.initialize();
    await expect(engine.dispose()).rejects.toBeInstanceOf(AggregateError);
    expect(healthy).toHaveBeenCalledOnce();
  });

  it('reports each failure once through the failure flow', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const engine = createEngine();
    engine.fail(new Error('Telemetry parent relay failed'));
    engine.fail(new Error('Telemetry parent relay failed'));
    engine.fail(new Error('Telemetry adapter filter failed'));
    expect(warning.mock.calls.map(([message]) => message)).toEqual([
      'Telemetry parent relay failed',
      'Telemetry adapter filter failed',
    ]);
    expect(engine.value.failures['Telemetry parent relay failed'].count).toBe(2);
  });
});
