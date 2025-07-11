import type z from 'zod';
import type { TelemetryMetricSchema } from './schemas.js';

/**
 * Represents the data structure for additional telemetry measurement.
 *
 * This type is derived from the `TelemetryItemSchema` and includes all properties
 * except the `type` property, which is not needed for measurement data.
 * It is used to define the structure of measurement data that can be passed to telemetry methods.
 * @see TelemetryItemSchema
 */
export type MeasurementData = Omit<z.input<typeof TelemetryMetricSchema>, 'type' | 'value'>;
// export type AdditionalMeasurementData = Omit<MeasurementData, 'name'>;

/**
 * Represents a function that takes a result of type `T` and returns a `AdditionalMeasurementData` object,
 * either synchronously or as a Promise.
 *
 * @typeParam T - The type of the input parameter to the function.
 * @param result - The result value to be transformed into measurement data.
 * @returns A `AdditionalMeasurementData` object or a Promise that resolves to a `AdditionalMeasurementData` object.
 */
export type MeasurementDataFunction<T> = (result: T) => MeasurementData | Promise<MeasurementData>;

/**
 * Represents the possible input types for measurement data.
 *
 * This type allows for flexibility in how measurement data is provided:
 * - A direct `AdditionalMeasurementData` object,
 * - A `Promise` that resolves to a `AdditionalMeasurementData` object,
 * - Or a `MeasurementDataFunction` that produces measurement data based on a generic parameter `T`.
 *
 * @typeParam T - The type parameter for the `MeasurementDataFunction`.
 */
export type MeasurementDataInput<T> =
  | MeasurementData
  | Promise<MeasurementData>
  | MeasurementDataFunction<T>;

/**
 * Options for measuring telemetry data.
 *
 * @property markAsMeasured - If true, marks the measurement as completed.
 * @property resetStartTime - If true, resets the start time before measuring.
 */
export type MeasureOptions = {
  markAsMeasured?: boolean;
  resetStartTime?: boolean;
};

/**
 * Options for resolving a measurement.
 *
 * @template T - The type of the measurement data.
 * @property data - Optional input data for the measurement.
 * @property options - Optional measurement options.
 */
export type ResolveOptions<T> = {
  data?: MeasurementDataInput<T>;
  options?: MeasureOptions;
};

/**
 * Options for resetting a measurement.
 *
 * @property preserveStartTime - If true, the start time will be preserved during the reset operation.
 */
export type ResetOptions = {
  preserveStartTime?: boolean;
};

/**
 * Represents a measurement utility that can track and record telemetry data.
 *
 * @remarks
 * This interface extends {@link Disposable}, indicating that implementations should provide cleanup logic.
 * It provides methods to measure events, resolve promises with measurement, execute functions with measurement,
 * and reset the measurement state.
 *
 * @interface
 *
 * @example
 * ```typescript
 * const measurement = new Measurement(telemetryProvider, { name: 'example.measurement' })
 * await new Promise((resolve) => setTimeout(resolve, 1000));
 * measurement.measure({ properties: { key: 'value' } });
 * ```
 * @example
 * ```typescript
 * using measurement = new Measurement(telemetryProvider, { name: 'example.resolve' });
 * // Do some work
 * ```
 */
export interface IMeasurement extends Disposable {
  /**
   * Clones the measurement instance.
   * This method creates a new instance of the Measurement class with the same data and start time as the original.
   * It allows you to create a new measurement instance without losing the original measurement's data.
   * This is useful when you want to start a new measurement while retaining the context of the original measurement.
   *
   * @example
   * ```typescript
   * const measurement = new Measurement(telemetryProvider, { name: 'example.clone' });
   * const promise = new Promise((resolve) => setTimeout(() => resolve('result'), 1000));
   * for(let i = 0; i < 5; i++) {
   *  const clonedMeasurement = measurement.clone();
   *  await clonedMeasurement.resolve(promise);
   * }
   * measurement.measure();
   * ```
   *
   * @param resetOptions Options to reset the measurement state.
   * @param resetOptions.preserveStartTime If true, the start time will not be reset when cloning the measurement.
   * This allows you to create a new measurement instance with the same start time as the original.
   * @returns A new instance of Measurement with the same data and start time as the original.
   * If `resetOptions.preserveStartTime` is true, the cloned measurement will retain the original start time.
   * Otherwise, the start time will be reset to the current time.
   */
  clone(resetOptions?: ResetOptions): IMeasurement;

  /**
   * Measures the time taken since the measurement was created or last reset.
   *
   * @param data additional data to include in the measurement.
   * This can be a static object, a promise that resolves to an object, or a function that takes the result of the measurement and returns an object or a promise that resolves to an object
   * @param options options for the measurement.
   * @param options.markAsMeasured If true, marks the measurement as measured, preventing it
   * from being automatically measured when disposed.
   * @param options.resetStartTime If true, resets the start time of the measurement.
   * This allows you to start a new measurement without creating a new instance.
   * @remarks
   * This method measures the time taken since the measurement was created or last reset.
   * It can include additional data in the measurement, which can be static or derived from the
   * measurement's result.
   * This is useful for performance tracking and telemetry in applications.
   */
  measure(data?: MeasurementData, options?: MeasureOptions): number;

  /**
   * Resolves a promise and includes measurement data.
   * This method allows you to resolve a promise and automatically measure the time it takes to complete it.
   * It can also include additional data in the measurement, which can be static or derived from
   * the promise's result.
   * This is useful for performance tracking and telemetry in applications.
   *
   * @example
   * ```typescript
   * const measurement = new Measurement(telemetryProvider, { name: 'example.resolve' });
   * const promise = new Promise((resolve) => setTimeout(() => resolve('result'), 1000));
   * const result = await measurement.resolve(promise, {
   *    data: (result) => ({ properties: { result } })
   * });
   * ```
   *
   * @see {@link IMeasurement.measure} for more details on the measurement options.
   *
   * @param promise The promise to resolve.
   * @param options Options for resolving the promise.
   * @param options.data Additional data to include in the measurement.
   * This can be a static object, a promise that resolves to an object, or a function that takes the result of the promise and returns an object or a promise that resolves to an object.
   * @param options.options Options for the measurement, such as whether to mark it as measured
   */
  resolve<T>(promise: Promise<T>, options?: ResolveOptions<T>): Promise<T>;

  /**
   * Executes a function and measures its execution time.
   * This method allows you to execute a function and automatically measure the time it takes to complete it.
   * It can also include additional data in the measurement, which can be static or derived from the function's result.
   * This is useful for performance tracking and telemetry in applications.
   *
   * @example
   * ```typescript
   * const measurement = new Measurement(telemetryProvider, { name: 'example.exec' });
   * const result = await measurement.exec(() => {
   *   // Simulate some work
   *   return new Promise((resolve) => setTimeout(resolve('foo'), 1000));
   * });
   * ```
   *
   * @see {@link IMeasurement.resolve} for more details on the measurement options.
   *
   * @param fn - The function to execute and measure.
   * This function should return a value or a promise that resolves to a value.
   * @param options - Options to customize the measurement.
   * @param options.data - Additional data to include in the measurement.
   * This can be a static object, a promise that resolves to an object, or a function that takes the result of `fn` and returns an object or a promise that resolves to an object.
   * @param options.options - Options for the measurement, such as whether to mark it as measured or reset the start time.
   * @returns A promise that resolves to the result of executing `fn`.
   */
  exec<T>(fn: () => T | Promise<T>, options?: ResolveOptions<T>): Promise<T>;

  /**
   * Resets the measurement state.
   * This method allows you to reset the measurement's start time and measured flag.
   *
   * This is useful when you want to start a new measurement without creating a new instance.
   *
   * @example
   * ```typescript
   * using measurement = new Measurement(telemetryProvider, { name: 'example.reset' });
   * for(const item of items) {
   *    // Perform some operation
   *    measurement.measure({ properties: { item } });
   *    // Reset the measurement state for the next item
   *    measurement.reset();
   * }
   * ```
   *
   * @param options - Options to reset the measurement state.
   * @param options.resetStartTime - If true, resets the start time of the measurement.
   */
  reset(options?: ResetOptions): void;
}
