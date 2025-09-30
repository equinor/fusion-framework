import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';

/**
 * Enables telemetry for a given module configurator.
 *
 * @param configurator - The module configurator instance to which telemetry should be attached.
 * @param options - Optional configuration for telemetry setup.
 * @param options.configure - An optional callback to further configure the telemetry builder. Can be synchronous or asynchronous.
 */
export const enableTelemetry = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  options?: {
    // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
    configure?: (configurator: ITelemetryConfigurator, ref?: any) => void | Promise<void>;
  },
): void => {
  configurator.addConfig({
    module,
    configure: async (builder, ref) => {
      if (options?.configure) {
        await Promise.resolve(options.configure(builder, ref));
      }
    },
  });
};
