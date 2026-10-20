import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';
import { LifecycleTelemetry } from './LifecycleTelemetry.js';
import type { TelemetrySource } from './diagnostic-context.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { TelemetryConfigurator } from './TelemetryConfigurator.js';

const captures = new WeakMap<object, LifecycleTelemetry>();

/**
 * Enables telemetry for a given module configurator.
 *
 * @param configurator - The module configurator instance to which telemetry should be attached.
 * @param options - Optional configuration for telemetry setup.
 * @param options.attachConfiguratorEvents - If true, attaches configurator events to the telemetry builder.
 * @param options.configure - An optional callback to further configure the telemetry builder. Can be synchronous or asynchronous.
 * @returns The lifecycle capture, when enabled, for reporting failures in host configuration callbacks.
 *
 * @remarks
 * This function adds telemetry configuration to the provided configurator. It supports attaching configurator events
 * and allows for additional custom configuration via the `configure` callback.
 *
 * @remarks
 * `attachConfiguratorEvents` allows for the automatic attachment of configurator events to the telemetry builder,
 * capturing safe terminal outcomes immediately with bounded buffering before a provider exists.
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
    source?: TelemetrySource;
    parent?: ITelemetryProvider;
    // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
    configure?: (configurator: ITelemetryConfigurator, ref?: any) => void | Promise<void>;
  },
): LifecycleTelemetry | undefined => {
  let capture = captures.get(configurator);
  const source = capture?.source ??
    options?.source ?? { source: 'framework' as const, hostId: crypto.randomUUID() };
  // Explicit opt-out also releases any capture installed by a host's default configuration.
  if (options?.attachConfiguratorEvents === false) {
    capture?.stop();
    captures.delete(configurator);
    capture = undefined;
  } else if (options?.attachConfiguratorEvents && !capture) {
    capture = new LifecycleTelemetry(configurator, source, options.parent);
    captures.set(configurator, capture);
  }
  configurator.addConfig({
    module,
    configure: async (builder, ref) => {
      const activeCapture = captures.get(configurator);
      // Custom configurators retain the public interface without requiring bootstrap internals.
      if (activeCapture && builder instanceof TelemetryConfigurator) {
        builder.setLifecycleCapture(activeCapture);
      }
      // Repeated enables share the original origin instead of generating unrelated host identities.
      if (options?.source || options?.attachConfiguratorEvents) {
        builder.setSource(source);
      }
      // Absence here leaves later explicit setParent(undefined) decisions untouched.
      if (options?.parent) {
        builder.setParent(options.parent);
      }
      // Attach configurator events to the telemetry builder only when opted in
      if (activeCapture) {
        builder.attachItems(activeCapture.items);
      }
      // Run the caller-supplied configure callback when one was provided
      if (options?.configure) {
        await Promise.resolve(options.configure(builder, ref));
      }
    },
  });
  return capture;
};
