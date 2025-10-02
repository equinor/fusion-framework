import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { TelemetryType } from '../static.js';
import { TelemetryEvent, TelemetryErrorEvent } from '../events.js';
import type { TelemetryConfig } from '../TelemetryConfigurator.interface.js';
import type { ITelemetryAdapter } from '../TelemetryAdapter.js';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
});

describe('TelemetryProvider', () => {
  let provider: TelemetryProvider;
  let adapter: ITelemetryAdapter;
  let eventProvider: IEventModuleProvider;
  let config: TelemetryConfig;

  beforeEach(async () => {
    adapter = {
      identifier: 'test-adapter',
      processItem: vi.fn(),
      initialize: vi.fn(),
    };
    eventProvider = {
      dispatchEvent: vi.fn(),
    } as unknown as IEventModuleProvider;
    config = {
      adapters: [adapter],
      defaultScope: ['default'],
    } as unknown as TelemetryConfig;
    provider = new TelemetryProvider(config, { event: eventProvider });
    await provider.initialize();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with adapters and event provider', () => {
    expect(provider).toBeInstanceOf(TelemetryProvider);
    expect(provider.getAdapter('test-adapter')).toBe(adapter);
  });

  it('should track event', async () => {
    provider.trackEvent({ name: 'test_event' });
    await vi.waitFor(() => {
      expect(eventProvider.dispatchEvent).toHaveBeenCalledWith(expect.any(TelemetryEvent));
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({ type: TelemetryType.Event, name: 'test_event' }),
      );
    });
  });

  it('should track exception', async () => {
    const error = new Error('test error');
    provider.trackException({
      name: 'test_exception',
      metadata: { code: 500 },
      exception: error,
      scope: ['custom'],
    });
    await vi.waitFor(() => {
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TelemetryType.Exception,
          name: 'test_exception',
          exception: error,
        }),
      );
    });
  });

  it('should track metric', async () => {
    provider.trackMetric({ name: 'test_metric', value: 42 });
    await vi.waitFor(() => {
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TelemetryType.Metric,
          name: 'test_metric',
          value: 42,
        }),
      );
    });
  });

  it('should track custom telemetry item', async () => {
    provider.trackCustom({
      name: 'test_custom',
    });
    await vi.waitFor(() => {
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({ type: TelemetryType.Custom, name: 'test_custom' }),
      );
    });
  });

  it('should track an event and call adapter.processItem', async () => {
    provider.trackEvent({
      name: 'test_event',
    });
    await vi.waitFor(() =>
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({ type: TelemetryType.Event, name: 'test_event' }),
      ),
    );
  });

  it('should merge defaultScope with item scope', async () => {
    provider.trackEvent({ name: 'scoped', scope: ['custom', 'foobar'] });
    await vi.waitFor(() => {
      expect(adapter.processItem).toHaveBeenCalledWith(
        expect.objectContaining({ scope: ['custom', 'foobar', 'default'] }),
      );
    });
  });

  it('should dispatch TelemetryErrorEvent if adapter throws', async () => {
    adapter.processItem = vi.fn(() => {
      throw new Error('fail');
    });
    provider = new TelemetryProvider({ ...config, adapters: [adapter] }, { event: eventProvider });
    await provider.initialize();
    provider.trackEvent({ name: 'fail_event' });

    await vi.waitFor(() => {
      expect(eventProvider.dispatchEvent).toHaveBeenCalledWith(expect.any(TelemetryErrorEvent));
    });
  });
});

describe('Measurement', () => {
  let provider: TelemetryProvider;
  let adapter: ITelemetryAdapter;
  let eventProvider: IEventModuleProvider;
  let config: TelemetryConfig;

  beforeEach(() => {
    adapter = {
      identifier: 'test-adapter',
      processItem: vi.fn(),
      initialize: vi.fn(),
    };
    eventProvider = {
      dispatchEvent: vi.fn(),
    } as unknown as IEventModuleProvider;
    config = {
      adapters: [adapter],
      defaultScope: ['default'],
    } as unknown as TelemetryConfig;
    provider = new TelemetryProvider(config, { event: eventProvider });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should support measure() and call trackMetric with elapsed time', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'measure1' });
    await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate async operation
    measurement.measure();

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'measure1',
          value: expect.any(Number),
        }),
      );
    });
  });

  it('should support measure() with additional data merged', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'measure1', metadata: { a: 1 }, scope: ['foo'] });
    await new Promise((resolve) => setTimeout(resolve, 1));
    measurement.measure({ metadata: { b: 2 }, scope: ['bar'] });

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'measure1',
          metadata: { a: 1, b: 2 },
          value: expect.any(Number),
          scope: ['foo', 'bar'],
        }),
      );
    });
  });

  it('should support measurement reset with preserveStartTime option', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'measure1' });

    // First measurement
    await new Promise((resolve) => setTimeout(resolve, 1));
    measurement.measure();

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'measure1',
          value: expect.any(Number),
        }),
      );
    });

    // Reset and measure again
    spy.mockClear();
    measurement.reset({ preserveStartTime: false });
    await new Promise((resolve) => setTimeout(resolve, 1));
    measurement.measure();

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'measure1',
          value: expect.any(Number),
        }),
      );
    });
  });

  it('should resolve promises and measure with data function', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'promise_measure' });

    const promise = Promise.resolve('success');
    const dataFn = vi.fn((result) => ({ properties: { result } }));

    await measurement.resolve(promise, { data: dataFn });

    expect(dataFn).toHaveBeenCalledWith('success');
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'promise_measure',
          properties: { result: 'success' },
          value: expect.any(Number),
        }),
      );
    });
  });

  it('should execute sync functions and measure', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'sync_exec' });

    const result = await measurement.exec(() => 'sync_result');

    expect(result).toBe('sync_result');
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'sync_exec',
          value: expect.any(Number),
        }),
      );
    });
  });

  it('should execute async functions and measure', async () => {
    const spy = vi.spyOn(provider, 'trackMetric');
    const measurement = provider.measure({ name: 'async_exec' });

    const result = await measurement.exec(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return 'async_result';
    });

    expect(result).toBe('async_result');
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'async_exec',
          value: expect.any(Number),
        }),
      );
    });
  });

  it('should relay telemetry to parent provider', async () => {
    const parent = {
      track: vi.fn(),
    } as unknown as TelemetryProvider;
    provider = new TelemetryProvider(config, { event: eventProvider });
    await provider.initialize({ parent });
    provider.trackEvent({ name: 'relay' });
    // Wait for async relay
    await vi.waitFor(() => {
      expect(parent.track).toHaveBeenCalledWith(expect.objectContaining({ name: 'relay' }));
    });
  });
});
