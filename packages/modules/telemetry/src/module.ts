import type { Module } from '@equinor/fusion-framework-module';

import type { EventModule } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';
import { TelemetryConfigurator } from './TelemetryConfigurator.js';
import { TelemetryProvider } from './TelemetryProvider.js';

/**
 * Represents the Telemetry module within the framework.
 *
 * @remarks
 * This type defines a module named `'telemetry'` that integrates with the framework's module system.
 * It specifies the provider and configurator interfaces for telemetry functionality, and declares
 * its dependencies on both the `EventModule` and itself (`TelemetryModule`).
 *
 * @typeParam ITelemetryProvider - The interface for the telemetry provider implementation.
 * @typeParam ITelemetryConfigurator - The interface for configuring telemetry behavior.
 * @typeParam EventModule - The module responsible for event handling, required as a dependency.
 * @typeParam TelemetryModule - Self-reference to allow for recursive or hierarchical module composition.
 */
export type TelemetryModule = Module<
  'telemetry',
  ITelemetryProvider,
  ITelemetryConfigurator,
  [EventModule, TelemetryModule]
>;

/**
 * Telemetry module definition for the Fusion Framework.
 *
 * @remarks
 * This module provides telemetry capabilities by configuring and initializing a telemetry provider.
 * It optionally integrates with the 'event' module if available.
 *
 * @type {TelemetryModule}
 *
 * @property {string} name - The name of the module ('telemetry').
 * @property {() => TelemetryConfigurator} configure - Factory function to create a new TelemetryConfigurator instance.
 * @property {(args) => Promise<ITelemetryProvider>} initialize - Asynchronous initializer that creates and returns a TelemetryProvider.
 *   - @param args - Initialization arguments, including configuration and module dependencies.
 *   - @returns A promise that resolves to an instance of ITelemetryProvider.
 */
export const module = {
  name: 'telemetry',
  configure: () => new TelemetryConfigurator(),
  initialize: async (args): Promise<ITelemetryProvider> => {
    const config = await (args.config as TelemetryConfigurator).createConfigAsync(args);
    const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
    return new TelemetryProvider(config, { event });
  },
} satisfies TelemetryModule;

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    telemetry: TelemetryModule;
  }
}
