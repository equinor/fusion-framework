import type {
  IModulesConfigurator,
  Module,
  ModuleConfigType,
} from '@equinor/fusion-framework-module';

import { AiConfigurator } from './AIConfigurator.js';
import { AiProvider } from './AIProvider.js';
import type { IAiProvider } from './AIProvider.js';

/** Module key used to register the AI module in the Fusion Framework module map. */
export type AiModuleKey = 'ai';

/** Module key constant for the AI module (`'ai'`). */
export const moduleKey: AiModuleKey = 'ai';

/** Type alias describing the AI module shape within the Fusion Framework module system. */
export type AiModule = Module<AiModuleKey, IAiProvider, AiConfigurator>;

/**
 * AI module definition for Fusion Framework.
 *
 * Service URI and bearer token are resolved by {@link AiConfigurator} via
 * default strategies that use the service discovery and MSAL auth modules.
 * Register custom strategies with {@link IAIConfigurator.addStrategy}.
 */
export const module: AiModule = {
  name: moduleKey,
  configure: () => new AiConfigurator(),
  initialize: async (args) => {
    const config = await args.config.createConfigAsync(args);
    return new AiProvider(config);
  },
};

/**
 * Enable the AI module on a Fusion Framework module configurator.
 *
 * The AI module resolves its service endpoint and credentials automatically
 * from Fusion service discovery and the MSAL auth module — no callback is
 * required.  Pass a `configure` callback to register additional or custom
 * strategies.
 *
 * @param config - The framework modules configurator.
 * @param configure - Optional callback that receives the {@link AiConfigurator}
 *   for registering custom strategies.
 *
 * @example
 * ```typescript
 * import { enableAI } from '@equinor/fusion-framework-module-ai';
 *
 * const configure = (config) => {
 *   enableAI(config);
 * };
 * ```
 */
export const enableAI = <TRef = unknown>(
  // biome-ignore lint/suspicious/noExplicitAny: accepts any framework module configurator
  config: IModulesConfigurator<any, any>,
  configure?: (config: ModuleConfigType<AiModule>, ref: TRef) => void,
): void => {
  config.addConfig({
    module,
    configure: (config, ref) => {
      if (configure) {
        configure(config, ref);
      }
    },
  });
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    ai: AiModule;
  }
}

export default module;
