import type { ITelemetryProvider } from './TelemetryProvider.interface.js';

/**
 * Optional provider capability for modules that report operational telemetry.
 *
 * Module providers implement `connectTelemetry` and let their module descriptor call it from
 * `postInitialize`, so initialization never waits for telemetry and the module keeps working
 * without it. Pass `undefined` to stop recording. Pair it with `createOperationalTelemetry`
 * from `@equinor/fusion-framework-module-telemetry/utils`.
 *
 * @example
 * ```ts
 * export interface IMyProvider extends TelemetryConnectable {
 *   load(): Promise<Item[]>;
 * }
 *
 * export const module: MyModule = {
 *   name: 'my-module',
 *   initialize: async (init) => new MyProvider(await init.config.createConfigAsync(init)),
 *   postInitialize: async ({ instance, modules }) => {
 *     instance.connectTelemetry?.(modules.telemetry);
 *   },
 * };
 * ```
 */
export interface TelemetryConnectable {
  /**
   * Connects the host telemetry provider used for this provider's operational records.
   * @param telemetry - Host telemetry provider, or `undefined` to record nothing.
   */
  connectTelemetry?(telemetry: ITelemetryProvider | undefined): void;
}
