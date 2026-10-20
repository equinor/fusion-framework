import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';
import { StartupCapture } from './lib/StartupCapture.js';

/**
 * Enables telemetry for a given module configurator.
 *
 * Registers the telemetry module and an optional configuration callback. Framework, app and
 * widget hosts already capture their own startup lifecycle; `attachConfiguratorEvents` only
 * matters for custom hosts and for opting out.
 *
 * @param configurator - The module configurator instance to which telemetry should be attached.
 * @param options - Optional configuration for telemetry setup.
 * @param options.attachConfiguratorEvents - `true` captures this configurator's lifecycle unless
 *   its host already does; `false` stops lifecycle records reaching this provider. A host still
 *   reports a failed startup to its parent.
 * @param options.configure - An optional callback to further configure the telemetry builder. Can be synchronous or asynchronous.
 *
 * @remarks
 * The lifecycle option applies synchronously when this is called, so capture starts before any
 * later configuration code runs. The `configure` callback is deferred until module initialization.
 *
 * @example
 * ```typescript
 * import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
 *
 * const configure = (configurator) => {
 *   enableTelemetry(configurator, {
 *     attachConfiguratorEvents: true,
 *     configure: (builder) => {
 *       builder.setAdapter('console', new ConsoleAdapter());
 *       builder.setMetadata(() => ({ appVersion: '1.0.0' }));
 *     },
 *   });
 * };
 * ```
 */
export const enableTelemetry = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  options?: {
    attachConfiguratorEvents?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
    configure?: (configurator: ITelemetryConfigurator, ref?: any) => void | Promise<void>;
  },
): void => {
  const attach = options?.attachConfiguratorEvents;
  configurator.addConfig({
    module,
    // Lifecycle capture must start now, before later configuration code can run.
    prepare:
      attach === undefined
        ? undefined
        : (builder) => {
            // Opting out stops lifecycle records reaching this provider; the last call wins.
            if (!attach) {
              builder.attachLifecycleItems(undefined);
              return;
            }
            // Hosts own their startup capture; only capture here when no host already does.
            if (!builder.hasLifecycleItems()) {
              builder.attachLifecycleItems(new StartupCapture(configurator).items);
            }
          },
    configure: options?.configure,
  });
};
