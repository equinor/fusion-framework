import type { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';

import { AIConfigurator } from './AIConfigurator.js';
import type { IAIConfigurator } from './AIConfigurator.interface.js';
import type { IAIProvider } from './AIProvider.js';
import { AIProvider } from './AIProvider.js';

export type AIModuleKey = 'ai';

export const moduleKey: AIModuleKey = 'ai';

export type AIModule = Module<AIModuleKey, IAIProvider, IAIConfigurator, []>;

/**
 * AI module definition for Fusion Framework.
 *
 * This module provides AI services including language models, embeddings,
 * and vector stores. It follows the standard Fusion Framework module pattern
 * with configuration and initialization phases.
 */
export const module: AIModule = {
  name: moduleKey,
  configure: () => new AIConfigurator(),
  initialize: async (args) => {
    // Resolve the configuration to get the actual service instances
    const resolvedConfig = await (args.config as AIConfigurator).createConfigAsync(args);

    // Create the AI provider with the resolved configuration
    return new AIProvider(resolvedConfig);
  },
};

/**
 * Method for enabling the AI module.
 * @param config - Configuration object for the modules
 * @param configure - Callback for configuring the AI module
 */
export const enableAI = (
  config: IModulesConfigurator<[], unknown>,
  configure: (configurator: IAIConfigurator) => void,
): void => {
  config.addConfig({ module, configure });
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    ai: AIModule;
  }
}

export default module;
