/**
 * @packageDocumentation
 *
 * Fusion Framework AI module — integrates language models, text embeddings,
 * and vector stores into Fusion Framework applications via Fusion service
 * discovery and MSAL authentication.
 *
 * ## Quick start
 *
 * ```typescript
 * import { enableAI } from '@equinor/fusion-framework-module-ai';
 *
 * const configure = (config) => {
 *   enableAI(config);
 * };
 *
 * // Provider usage
 * const model = modules.ai.useModel('gpt-4.1');
 * const embedder = modules.ai.useEmbed('text-embedding-3-large');
 * const index = modules.ai.useIndex('my-index');
 * ```
 *
 * @module @equinor/fusion-framework-module-ai
 */

// Core module components
export { AiConfigurator as AIConfigurator } from './AIConfigurator.js';
export { AiProvider as AIProvider } from './AIProvider.js';
export { module, enableAI } from './module.js';

// Essential types for consumers
export type { AIModuleConfig, IAIConfigurator } from './AIConfigurator.interface.js';
export type { IAiProvider as IAIProvider } from './AIProvider.js';
export type { AiModule as AIModule, AiModuleKey as AIModuleKey } from './module.js';
export { AIError } from './AIError.js';

// Strategy constants and types — needed by consumers that construct AIProvider directly
export {
  FUSION_MODEL_STRATEGY_NAME,
  FUSION_EMBED_STRATEGY_NAME,
  FUSION_INDEX_STRATEGY_NAME,
  STRATEGY_TYPE,
} from './lib/strategies/index.js';
export type {
  Strategy,
  ModelStrategy,
  EmbedStrategy,
  IndexStrategy,
} from './lib/strategies/index.js';
