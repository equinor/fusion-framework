import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type TelemetryModule } from './module.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';

/**
 * Enables the Telemetry module by adding its configuration to the provided modules configurator.
 *
 * @param configurator - The modules configurator instance to which the Telemetry module configuration will be added.
 * @param options - Optional configuration for customizing the Telemetry module lifecycle:
 *   - `configure`: A callback to further configure the Telemetry module.
 *   - `initialize`: A callback to customize the initialization logic of the Telemetry module.
 *   - `postInitialize`: A callback to run custom logic after the Telemetry module has been initialized.
 *
 * @remarks
 * This function wraps the Telemetry module's configuration, initialization, and post-initialization
 * steps, allowing consumers to inject custom logic at each stage via the `options` parameter.
 */
export const enableTelemetry = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  options?: {
    configure?: (configurator: ITelemetryConfigurator) => void;
    initialize?: TelemetryModule['initialize'];
    postInitialize?: TelemetryModule['postInitialize'];
  },
): void => {
  configurator.addConfig({
    module: {
      name: module.name,
      configure: async () => {
        const configurator = module.configure();
        if (options?.configure) {
          await Promise.resolve(options.configure(configurator));
        }
        return configurator;
      },
      initialize: async (args) => {
        if (options?.initialize) {
          await Promise.resolve(options.initialize(args));
        }
        return module.initialize(args);
      },
      postInitialize: async (args) => {
        if (options?.postInitialize) {
          await Promise.resolve(options.postInitialize(args));
        }
      },
    } satisfies TelemetryModule,
  });
};
