import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type TelemetryModule } from './module.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';
import { mapConfiguratorEvents } from './utils/map-configurator-events.js';

/**
 * Enables telemetry for a given module configurator.
 *
 * @param configurator - The module configurator instance to which telemetry should be attached.
 * @param options - Optional configuration for telemetry setup.
 * @param options.attachConfiguratorEvents - If true, attaches configurator events to the telemetry builder.
 * @param options.configure - An optional callback to further configure the telemetry builder. Can be synchronous or asynchronous.
 *
 * @remarks
 * This function adds telemetry configuration to the provided configurator. It supports attaching configurator events
 * and allows for additional custom configuration via the `configure` callback.
 *
 * @remarks
 * `attachConfiguratorEvents` allows for the automatic attachment of configurator events to the telemetry builder,
 * ensuring that relevant events are captured and processed. __NOTE__ if the configurator crashes before the telemetry
 * builder is fully initialized, some events may be missed.
 */
export const enableTelemetry = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  options?: {
    attachConfiguratorEvents?: boolean;
    configure?: (configurator: ITelemetryConfigurator, ref?: any) => void | Promise<void>;
  },
): void => {
  configurator.addConfig({
    module,
    configure: async (builder, ref) => {
      if (options?.attachConfiguratorEvents) {
        builder.attachItems(mapConfiguratorEvents(configurator));
      }
      if (options?.configure) {
        await Promise.resolve(options.configure(builder, ref));
      }
    },
  });
};
