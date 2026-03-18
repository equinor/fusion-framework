import type { Module } from '@equinor/fusion-framework-module';
import { type ISignalRConfigurator, SignalRConfigurator } from './SignalRModuleConfigurator';

import { type ISignalRProvider, SignalRModuleProvider } from './SignalRModuleProvider';

/** String literal key used to register the SignalR module in the Fusion Framework module system. */
export type SignalRModuleKey = 'signalR';

/** Module registration key for the SignalR module (`'signalR'`). */
export const moduleKey: SignalRModuleKey = 'signalR';

/**
 * Module type definition for the SignalR module.
 *
 * Binds the module key, provider interface ({@link ISignalRProvider}), and
 * configurator interface ({@link ISignalRConfigurator}) together for the
 * Fusion Framework module system.
 */
export type SignalRModule = Module<SignalRModuleKey, ISignalRProvider, ISignalRConfigurator>;

/**
 * SignalR module instance that can be registered with a Fusion Framework configurator.
 *
 * During the `configure` phase, a {@link SignalRConfigurator} is created.
 * During the `initialize` phase, the configurator builds its {@link SignalRConfig}
 * and produces a {@link SignalRModuleProvider}.
 *
 * @example
 * ```ts
 * import { ModuleConfigurator } from '@equinor/fusion-framework-module';
 * import signalR from '@equinor/fusion-framework-module-signalr';
 *
 * configurator.addConfig({ module: signalR });
 * ```
 */
export const module: SignalRModule = {
  name: moduleKey,
  configure: () => new SignalRConfigurator(),
  initialize: async (init) => {
    const config = await (init.config as SignalRConfigurator).createConfig(init);
    return new SignalRModuleProvider(config);
  },
};

export default module;

/** Augments the global `Modules` interface so that `'signalR'` is a known module key. */
declare module '@equinor/fusion-framework-module' {
  interface Modules {
    signalR: SignalRModule;
  }
}
