import { ITelemetryConfigurator, TelemetryConfigurator } from './configurator';
import { ITelemetryProvider, TelemetryProvider } from './provider';
import type { Module } from '@equinor/fusion-framework-module';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';

export type TelemetryModule = Module<
    'telemetry',
    ITelemetryProvider,
    ITelemetryConfigurator,
    [MsalModule]
>;

export const module: TelemetryModule = {
    name: 'telemetry',
    configure: () => new TelemetryConfigurator(),
    initialize: async ({ config, requireInstance }): Promise<ITelemetryProvider> =>
        new TelemetryProvider(config, await requireInstance('auth')),
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        telemetry: TelemetryModule;
    }
}
