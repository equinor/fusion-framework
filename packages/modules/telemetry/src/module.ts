import type { Module } from '@equinor/fusion-framework-module';

import type { EventModule } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface.js';
import { TelemetryConfigurator } from './TelemetryConfigurator.js';
import { TelemetryProvider } from './TelemetryProvider.js';

export type TelemetryModule = Module<
  'telemetry',
  ITelemetryProvider,
  ITelemetryConfigurator,
  [EventModule, TelemetryModule]
>;

export const module: TelemetryModule = {
  name: 'telemetry',
  configure: () => new TelemetryConfigurator(),
  initialize: async (args): Promise<ITelemetryProvider> => {
    const config = await (args.config as TelemetryConfigurator).createConfigAsync(args);
    const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
    return new TelemetryProvider(config, { event, parent: args.ref?.telemetry });
  },
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    telemetry: TelemetryModule;
  }
}
