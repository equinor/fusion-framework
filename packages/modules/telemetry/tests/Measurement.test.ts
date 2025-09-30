import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Measurement } from '../src/Measurement.js';
import type { ITelemetryProvider } from '../src/TelemetryProvider.interface.js';
import type { MeasurementData } from '../src/Measurement.interface.js';

// Mock performance.now
let now = 1000;
globalThis.performance = {
  now: vi.fn(() => now),
} as any;

describe('Measurement', () => {
  let provider: ITelemetryProvider;
  let measureSpy: ReturnType<typeof vi.fn>;
  let baseData: MeasurementData;

  beforeEach(() => {
    now = 1000;
    measureSpy = vi.fn();
    provider = { trackMetric: measureSpy } as any;
    baseData = { name: 'test' };
  });

  it('should initialize with provider and data', () => {
    const m = new Measurement(provider, baseData);
    expect(m).toBeInstanceOf(Measurement);
  });

  it('should call provider.measure with elapsed time and merged data', () => {
    const m = new Measurement(provider, baseData);
    now += 50;
    m.measure({ properties: { foo: 'bar' } });
    expect(measureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 50,
        properties: { foo: 'bar' },
      }),
    );
  });

  it('should reset startTime if resetStartTime is true', () => {
    const m = new Measurement(provider, baseData);
    now += 20;
    m.measure(undefined, { resetStartTime: true });
    const prevStart = now;
    now += 30;
    m.measure();
    expect(measureSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 30,
      }),
    );
  });

  it('should clone with or without preserving startTime', () => {
    const m = new Measurement(provider, baseData);
    now += 5;
    const clone1 = m.clone();
    now += 10;
    const clone2 = m.clone({ preserveStartTime: true });

    clone1.measure();
    expect(measureSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 10,
      }),
    );
    clone2.measure();
    expect(measureSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 15, // 10 + 5 from original
      }),
    );
  });

  it('should reset startTime on reset', () => {
    const m = new Measurement(provider, baseData);
    now += 10;
    m.reset();
    now += 20;
    m.measure();
    expect(measureSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 20,
      }),
    );
  });

  it('should preserve startTime on reset if option is set', () => {
    const m = new Measurement(provider, baseData);
    now += 10;
    m.reset({ preserveStartTime: true });
    m.measure();
    expect(measureSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 10,
      }),
    );
  });

  it('should resolve a promise and measure with data function', async () => {
    const m = new Measurement(provider, baseData);
    now += 20;
    const promise = Promise.resolve('result');
    const dataFn = vi.fn((res) => ({ properties: { result: res } }));
    await m.resolve(promise, { data: dataFn });
    expect(dataFn).toHaveBeenCalledWith('result');
    expect(measureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: { result: 'result' },
        value: 20,
      }),
    );
  });

  it('should exec a sync function and measure', async () => {
    const m = new Measurement(provider, baseData);
    const fn = vi.fn(() => {
      now += 15;
      return 42;
    });
    const result = await m.exec(fn);
    expect(result).toBe(42);
    expect(measureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 15,
      }),
    );
  });

  it('should exec an async function and measure', async () => {
    const m = new Measurement(provider, baseData);
    const fn = vi.fn(async () => {
      now += 25;
      return 'async';
    });
    const result = await m.exec(fn);
    expect(result).toBe('async');
    expect(measureSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 25,
      }),
    );
  });

  it('should call measure on dispose if not measured', () => {
    using m = new Measurement(provider, baseData);
    now += 5;
    m[Symbol.dispose]();
    expect(measureSpy).toHaveBeenCalled();
  });

  // it('should not call measure on dispose if already measured', () => {
  //   const m = new Measurement(provider, baseData);
  //   now += 5;
  //   m.measure(undefined, { markAsMeasured: true });
  //   measureSpy.mockClear();
  //   m[Symbol.dispose]();
  //   expect(measureSpy).not.toHaveBeenCalled();
  // });
});
