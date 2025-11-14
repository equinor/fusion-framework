import { BaseConfigBuilder } from '@equinor/fusion-framework-module';
import type {
  ConfigBuilderCallback,
  ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import { from, type ObservableInput, of } from 'rxjs';
import { defaultIfEmpty, filter, map, mergeMap, scan, shareReplay } from 'rxjs/operators';

import type { IModel, IEmbed, IVectorStore } from './lib/types.js';
import type {
  ValueOrCallback,
  AIModuleConfig,
  IAIConfigurator,
  ConfiguredService,
} from './AIConfigurator.interface.js';

/**
 * Creates a resolver function that processes configuration records supporting both direct values and factory functions.
 *
 * This utility handles the common pattern of allowing users to configure services either by:
 * - Providing service instances directly (eager initialization)
 * - Providing factory functions that create services (lazy initialization)
 *
 * @template T - The type of service being configured (IModel, IEmbed, etc.)
 * @param items - Record mapping identifiers to either service instances or factory functions
 * @returns A callback function that takes configuration args and returns an observable of resolved services
 *
 * @internal This is an internal utility function used by the AIConfigurator class
 */
function resolveConfigRecord<T>(
  items: Record<string, ValueOrCallback<T>>,
): (args: ConfigBuilderCallbackArgs) => ObservableInput<Record<string, T>> {
  return (args: ConfigBuilderCallbackArgs) =>
    from(Object.entries(items)).pipe(
      // Process each configuration entry (identifier -> valueOrCallback)
      mergeMap(([identifier, valueOrCallback]): ObservableInput<[string, T]> => {
        if (typeof valueOrCallback === 'function') {
          // For factory functions: call them with config args, filter out null/undefined results
          return from((valueOrCallback as ConfigBuilderCallback<T>)(args)).pipe(
            filter((adapter): adapter is T => !!adapter), // Remove falsy values
            map((adapter) => [identifier, adapter] as const), // Pair with identifier
          );
        }
        // For direct values: emit immediately
        return of([identifier, valueOrCallback as T]);
      }),
      // Accumulate all resolved services into a single record
      scan(
        (acc, [identifier, adapter]) => {
          acc[identifier] = adapter;
          return acc;
        },
        {} as Record<string, T>,
      ),
      // Ensure we always emit at least an empty object if no entries exist
      defaultIfEmpty({}),
      // Cache the result and share it among multiple subscribers
      shareReplay({ bufferSize: 1, refCount: true }),
    );
}

/**
 * Fluent API configurator for AI services in Fusion Framework applications.
 *
 * The `AIConfigurator` provides a type-safe, fluent interface for configuring AI services
 * including language models, embeddings, and vector stores. It supports both eager initialization
 * (providing service instances directly) and lazy initialization (providing factory functions).
 *
 * This configurator integrates with the Fusion Framework's module system and ensures that
 * all configured services are properly resolved and made available to the application.
 *
 * @example
 * ```typescript
 * // Basic usage with direct instances
 * const configurator = new AIConfigurator()
 *   .setModel('gpt-4', new AzureOpenAIModel({ apiKey: '...' }))
 *   .setEmbedding('embeddings', new AzureOpenAiEmbed({ apiKey: '...' }))
 *   .setVectorStore('vector-db', new AzureVectorStore({ endpoint: '...' }));
 *
 * // Advanced usage with factory functions for lazy initialization
 * const configurator = new AIConfigurator()
 *   .setModel('gpt-4-lazy', (config) => new AzureOpenAIModel({
 *     apiKey: config.env.AZURE_OPENAI_API_KEY
 *   }))
 *   .setEmbedding('embeddings-lazy', (config) => new AzureOpenAiEmbed({
 *     apiKey: config.env.AZURE_OPENAI_API_KEY
 *   }));
 * ```
 *
 * @public
 */
export class AIConfigurator extends BaseConfigBuilder<AIModuleConfig> implements IAIConfigurator {
  // Internal storage for configured services - maps identifiers to either instances or factory functions
  #models: Record<string, ValueOrCallback<IModel>> = {};
  #embeddings: Record<string, ValueOrCallback<IEmbed>> = {};
  #vectorStores: Record<string, ValueOrCallback<IVectorStore>> = {};

  /**
   * Creates a new AIConfigurator instance.
   *
   * Initializes the configurator and registers all configuration resolvers
   * with the base config builder. Each service type (models, embeddings, vector stores)
   * gets its own resolver that handles both direct values and factory functions.
   */
  constructor() {
    super();
    // Register resolvers for each service type with the base configurator
    this._set('models', resolveConfigRecord(this.#models));
    this._set('embeddings', resolveConfigRecord(this.#embeddings));
    this._set('vectorStores', resolveConfigRecord(this.#vectorStores));
  }

  /**
   * Registers a language model configuration.
   *
   * @param identifier - Unique identifier for this model configuration. Used to reference
   *                   the model in your application code.
   * @param modelOrFactory - Either a configured IModel instance (for eager initialization)
   *                        or a factory function that returns an IModel (for lazy initialization).
   *                        Factory functions receive ConfigBuilderCallbackArgs containing
   *                        framework configuration, environment variables, and module dependencies.
   * @returns This configurator instance for method chaining
   *
   * @example
   * ```typescript
   * // Direct instance
   * configurator.setModel('gpt-4', new AzureOpenAIModel({
   *   apiKey: 'your-key',
   *   modelName: 'gpt-4'
   * }));
   *
   * // Factory function for lazy initialization
   * configurator.setModel('gpt-4-lazy', (config) => new AzureOpenAIModel({
   *   apiKey: config.env.AZURE_OPENAI_API_KEY,
   *   modelName: 'gpt-4'
   * }));
   * ```
   */
  public setModel(identifier: string, modelOrFactory: ValueOrCallback<IModel>): this {
    this.#models[identifier] = modelOrFactory;
    return this;
  }

  /**
   * Registers an embedding service configuration.
   *
   * @param identifier - Unique identifier for this embedding configuration. Used to reference
   *                   the embedding service in your application code.
   * @param embeddingOrFactory - Either a configured IEmbed instance (for eager initialization)
   *                            or a factory function that returns an IEmbed (for lazy initialization).
   *                            Factory functions receive ConfigBuilderCallbackArgs containing
   *                            framework configuration, environment variables, and module dependencies.
   * @returns This configurator instance for method chaining
   *
   * @example
   * ```typescript
   * // Direct instance
   * configurator.setEmbedding('embeddings', new AzureOpenAiEmbed({
   *   apiKey: 'your-key',
   *   modelName: 'text-embedding-ada-002'
   * }));
   *
   * // Factory function for lazy initialization
   * configurator.setEmbedding('embeddings-lazy', (config) => new AzureOpenAiEmbed({
   *   apiKey: config.env.AZURE_OPENAI_API_KEY,
   *   modelName: 'text-embedding-ada-002'
   * }));
   * ```
   */
  public setEmbedding(identifier: string, embeddingOrFactory: ValueOrCallback<IEmbed>): this {
    this.#embeddings[identifier] = embeddingOrFactory;
    return this;
  }

  /**
   * Registers a vector store configuration.
   *
   * @param identifier - Unique identifier for this vector store configuration. Used to reference
   *                   the vector store in your application code.
   * @param vectorStoreOrFactory - Either a configured IVectorStore instance (for eager initialization)
   *                              or a factory function that returns an IVectorStore (for lazy initialization).
   *                              Factory functions receive ConfigBuilderCallbackArgs containing
   *                              framework configuration, environment variables, and module dependencies.
   * @returns This configurator instance for method chaining
   *
   * @example
   * ```typescript
   * // Direct instance
   * configurator.setVectorStore('vector-db', new AzureVectorStore({
   *   endpoint: 'https://your-search-service.search.windows.net',
   *   apiKey: 'your-key',
   *   indexName: 'documents'
   * }));
   *
   * // Factory function for lazy initialization
   * configurator.setVectorStore('vector-db-lazy', (config) => new AzureVectorStore({
   *   endpoint: config.env.AZURE_SEARCH_ENDPOINT,
   *   apiKey: config.env.AZURE_SEARCH_API_KEY,
   *   indexName: 'documents'
   * }));
   * ```
   */
  public setVectorStore(
    identifier: string,
    vectorStoreOrFactory: ValueOrCallback<IVectorStore>,
  ): this {
    this.#vectorStores[identifier] = vectorStoreOrFactory;
    return this;
  }

  public getService<T extends keyof AIModuleConfig>(
    type: T,
    identifier: string,
  ): ConfiguredService<T> {
    switch (type) {
      case 'models': {
        return this.#models[identifier] as ConfiguredService<T>;
      }
      case 'embeddings': {
        return this.#embeddings[identifier] as ConfiguredService<T>;
      }
      case 'vectorStores': {
        return this.#vectorStores[identifier] as ConfiguredService<T>;
      }
      default: {
        throw new Error(`Unknown service type: ${type}`);
      }
    }
  }
}
