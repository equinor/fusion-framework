/**
 * @packageDocumentation
 *
 * Fusion Framework AI module — integrates language models, text embeddings,
 * and vector stores into Fusion Framework applications.
 *
 * ## Quick start
 *
 * ```typescript
 * import { enableAI } from '@equinor/fusion-framework-module-ai';
 * import { AzureOpenAIModel } from '@equinor/fusion-framework-module-ai/azure';
 *
 * const configure = (config) => {
 *   enableAI(config, (ai) => {
 *     ai.setModel('gpt-4', new AzureOpenAIModel({ azureOpenAIApiKey: '...' }));
 *   });
 * };
 * ```
 *
 * @module @equinor/fusion-framework-module-ai
 */

// Core module components
export { AIConfigurator } from './AIConfigurator.js';
export { AIProvider } from './AIProvider.js';
export { module, enableAI } from './module.js';

// Essential types for consumers
export type {
  ValueOrCallback,
  AIModuleConfig,
  IAIConfigurator,
} from './AIConfigurator.interface.js';
export type { IAIProvider, AIServiceType } from './AIProvider.js';
export type { AIModule, AIModuleKey } from './module.js';
export { AIError } from './AIError.js';
