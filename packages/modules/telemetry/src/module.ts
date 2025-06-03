import type { Module } from '@equinor/fusion-framework-module';
import type { ITelemetryProvider } from './TelemetryProvider.interface';
import type { ITelemetryConfigurator } from './TelemetryConfigurator.interface';
import { TelemetryConfigurator } from './TelemetryConfigurator';
import { TelemetryProvider } from './TelemetryProvider';

export type TelemetryModule = Module<'telemetry', ITelemetryProvider, ITelemetryConfigurator>;

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
