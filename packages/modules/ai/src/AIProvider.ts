import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IModel, IEmbed, IVectorStore } from './lib/types.js';
import type { AIModuleConfig } from './AIConfigurator.interface.js';
import { version } from './version.js';

/**
 * Discriminated key used when calling {@link IAIProvider.getService}.
 *
 * | Value          | Returns         |
 * |----------------|----------------|
 * | `'chat'`       | {@link IModel}  |
 * | `'embeddings'` | {@link IEmbed}  |
 * | `'search'`     | {@link IVectorStore} |
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
 * Runtime provider that gives application code access to configured AI services.
 *
 * Created automatically by the AI module during Fusion Framework initialisation.
 * Use {@link IAIProvider.getService} to retrieve language models, embedding
 * services, or vector stores by the identifier supplied during configuration.
 *
 * @example
 * ```typescript
 * const ai = modules.ai;
 * const model = ai.getService('chat', 'gpt-4');
 * const response = await model.invoke('Summarise this document');
 * ```
 */
export class AIProvider extends BaseModuleProvider<AIModuleConfig> implements IAIProvider {
  #models: Record<string, IModel>;
  #embeddings: Record<string, IEmbed>;
  #vectorStores: Record<string, IVectorStore>;

  /**
   * @param config - Resolved AI module configuration containing all registered services.
   */
  constructor(config: AIModuleConfig) {
    super({ version, config });

    // The configurator has already resolved the services, so we can cast them
    this.#models = config.models || {};
    this.#embeddings = config.embeddings || {};
    this.#vectorStores = config.vectorStores || {};
  }

  /**
   * Retrieve a configured AI service by type and identifier.
   *
   * @template T - The service type discriminator.
   * @param type - Service category — `'chat'`, `'embeddings'`, or `'search'`.
   * @param identifier - The identifier used when the service was registered via {@link IAIConfigurator}.
   * @returns The resolved service instance.
   * @throws {Error} When no service is registered under the given type and identifier.
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
