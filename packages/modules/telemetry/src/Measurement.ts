import type {
  IMeasurement,
  MeasurementData,
  MeasureOptions,
  ResetOptions,
  ResolveOptions,
} from './Measurement.interface.js';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';

import { mergeTelemetryItem } from './utils/merge-telemetry-item.js';

/**
 * Represents a telemetry measurement that tracks elapsed time and reports measurement data
 * to a telemetry provider. Supports cloning, resetting, and marking measurements as completed.
 *
 * @remarks
 * - The measurement starts timing upon instantiation.
 * - Provides methods to measure elapsed time, reset the timer, clone the measurement, and
 *   automatically measure on disposal if not already measured.
 * - Can be used to wrap asynchronous operations and automatically record their duration.
 *
 * @example
 * ```typescript
 * const measurement = new Measurement(provider, { name: 'operation' });
 * // ... perform operation ...
 * measurement.measure();
 * ```
 *
 * @public
 */
export class Measurement implements IMeasurement {
  #provider: ITelemetryProvider;
  #data: MeasurementData;
  #startTime: number;
  #measured?: boolean;

  /**
   * Initializes a new instance of the Measurement class.
   *
   * @param provider - The telemetry provider responsible for handling telemetry data.
   * @param data - The measurement data to be associated with this instance.
   */
  constructor(provider: ITelemetryProvider, data: MeasurementData) {
    this.#data = data;
    this.#provider = provider;
    this.#startTime = performance.now();
  }

  /**
   * Creates a new `Measurement` instance that is a copy of the current one.
   *
   * @param resetOptions - Options to control which properties are preserved in the clone.
   *   - `preserveStartTime`: If `true`, the start time of the measurement is preserved in the clone.
   * @returns A new `Measurement` instance with copied data and optionally preserved start time.
   */
  public clone(resetOptions: ResetOptions = {}): Measurement {
    const clonedMeasurement = new Measurement(this.#provider, this.#data);
    if (resetOptions.preserveStartTime) {
      clonedMeasurement.#startTime = this.#startTime;
    }
    return clonedMeasurement;
  }

  /**
   * Resets the measurement state.
   *
   * @param options - Optional settings for the reset operation.
   * @param options.preserveStartTime - If true, the start time will not be reset; otherwise, it will be set to the current time.
   *
   * Resets the measured flag and, unless `preserveStartTime` is true, updates the start time to the current performance time.
   */
  public reset(options?: ResetOptions) {
    if (!options?.preserveStartTime) {
      this.#startTime = performance.now();
    }
    this.#measured = false;
  }

  /**
   * Measures the elapsed time since the last start time and sends the measurement data
   * to the telemetry provider. Optionally marks the measurement as completed and/or
   * resets the start time for subsequent measurements.
   *
   * @param data - Optional additional measurement data to merge with the existing data.
   * @param options - Optional measurement options.
   * @param options.markAsMeasured - If true, marks this measurement as completed.
   * @param options.resetStartTime - If true, resets the start time after measuring.
   */
  public measure(data?: MeasurementData, options?: MeasureOptions): number {
    const measuredData = mergeTelemetryItem(this.#data, data ?? {});
    const duration = performance.now() - this.#startTime;
    this.#provider.trackMetric({
      ...measuredData,
      value: duration,
    });
    if (options?.markAsMeasured) {
      this.#measured = true;
    }
    if (options?.resetStartTime) {
      this.#startTime = performance.now();
    }
    return duration;
  }

  /**
   * Resolves a given promise, measures the result using the provided options, and returns the resolved value.
   *
   * @typeParam T - The type of the resolved value from the promise.
   * @param promise - The promise to resolve.
   * @param options - Optional configuration for resolving and measuring:
   *   - `data`: A value or a function that receives the resolved result and returns measurement data.
   *   - `options`: Additional options to pass to the `measure` method.
   * @returns A promise that resolves to the value of the input promise.
   */
  public async resolve<T>(promise: Promise<T>, options?: ResolveOptions<T>): Promise<T> {
    const result = await promise;
    const endData = typeof options?.data === 'function' ? options?.data(result) : options?.data;
    this.measure(await Promise.resolve(endData), options?.options);
    return result;
  }

  /**
   * Executes the provided function and resolves its result using the `resolve` method.
   * The function `fn` can return either a value of type `T` or a Promise of type `T`.
   * Optionally, resolution options can be provided.
   *
   * @typeParam T - The return type of the function to execute.
   * @param fn - A function that returns a value or a Promise to be resolved.
   * @param options - Optional resolution options to customize the resolve behavior.
   * @returns A Promise that resolves to the result of the executed function.
   */
  public exec<T>(fn: () => T | Promise<T>, options?: ResolveOptions<T>): Promise<T> {
    return this.resolve(Promise.resolve(fn()), options);
  }

  /**
   * Disposes of the measurement instance. If the measurement has not yet been taken,
   * this method ensures that it is performed before disposal.
   *
   * This method is intended to be used with the ECMAScript `Symbol.dispose` protocol,
   * allowing for automatic resource management when used in a `using` statement.
   *
   * @see https://github.com/tc39/proposal-explicit-resource-management
   */
  [Symbol.dispose]() {
    if (!this.#measured) {
      this.measure();
    }
  }
}
