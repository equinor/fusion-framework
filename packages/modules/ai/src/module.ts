import type { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';

import { AIConfigurator } from './AIConfigurator.js';
import type { IAIConfigurator } from './AIConfigurator.interface.js';
import type { IAIProvider } from './AIProvider.js';
import { AIProvider } from './AIProvider.js';

/** Module key used to register the AI module in the Fusion Framework module map. */
export type AIModuleKey = 'ai';

/** Module key constant for the AI module (`'ai'`). */
export const moduleKey: AIModuleKey = 'ai';

/** Type alias describing the AI module shape within the Fusion Framework module system. */
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
 * Enable the AI module on a Fusion Framework module configurator.
 *
 * Call this inside `configureModules` to register the AI module and provide
 * a callback that configures language models, embedding services, and vector stores.
 *
 * @param config - The framework modules configurator.
 * @param configure - Callback that receives the {@link IAIConfigurator} for service registration.
 *
 * @example
 * ```typescript
 * import { enableAI } from '@equinor/fusion-framework-module-ai';
 *
 * const configure = (config) => {
 *   enableAI(config, (ai) => {
 *     ai.setModel('gpt-4', new AzureOpenAIModel({ azureOpenAIApiKey: '...' }));
 *   });
 * };
 * ```
 */
export const enableAI = (
  config: IModulesConfigurator<any, any>,
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
