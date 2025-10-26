import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IModel, IEmbed, IVectorStore } from './lib/types.js';
import type { AIModuleConfig } from './AIConfigurator.interface.js';
import { version } from './version.js';

/**
 * Type for AI service types.
 */
export type AIServiceType = 'chat' | 'embeddings' | 'search';

/**
 * Interface for AI service provider.
 *
 * Provides access to configured AI services including language models,
 * embeddings, and vector stores. Services are resolved from the configuration
 * and made available through this provider interface.
 */
export interface IAIProvider {
  /**
   * Gets a configured AI service by type and identifier.
   * @param type - The type of service ('chat', 'embeddings', or 'search')
   * @param identifier - The identifier used when configuring the service
   * @returns The configured service instance
   * @throws Error if the service is not found
   */
  getService<T extends AIServiceType>(
    type: T,
    identifier: string,
  ): T extends 'chat' ? IModel : T extends 'embeddings' ? IEmbed : IVectorStore;
}

/**
 * Provider implementation for AI services.
 *
 * The AIProvider extends BaseModuleProvider and implements IAIProvider,
 * providing access to configured AI services including language models,
 * embeddings, and vector stores.
 */
export class AIProvider extends BaseModuleProvider<AIModuleConfig> implements IAIProvider {
  #models: Record<string, IModel>;
  #embeddings: Record<string, IEmbed>;
  #vectorStores: Record<string, IVectorStore>;

  constructor(config: AIModuleConfig) {
    super({ version, config });

    // The configurator has already resolved the services, so we can cast them
    this.#models = config.models || {};
    this.#embeddings = config.embeddings || {};
    this.#vectorStores = config.vectorStores || {};
  }

  /**
   * Gets a configured AI service by type and identifier.
   */
  public getService<T extends AIServiceType>(
    type: T,
    identifier: string,
  ): T extends 'chat' ? IModel : T extends 'embeddings' ? IEmbed : IVectorStore {
    switch (type) {
      case 'chat': {
        const model = this.#models[identifier];
        if (!model) {
          throw new Error(`Chat service with identifier '${identifier}' not found`);
        }
        return model as any;
      }
      case 'embeddings': {
        const embedding = this.#embeddings[identifier];
        if (!embedding) {
          throw new Error(`Embedding service with identifier '${identifier}' not found`);
        }
        return embedding as any;
      }
      case 'search': {
        const vectorStore = this.#vectorStores[identifier];
        if (!vectorStore) {
          throw new Error(`Search service with identifier '${identifier}' not found`);
        }
        return vectorStore as any;
      }
      default:
        throw new Error(`Unknown service type: ${type}`);
    }
  }
}
