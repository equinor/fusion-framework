import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { IModel, IEmbed, IVectorStore } from './lib/types.js';

/**
 * A service instance **or** a factory function that lazily creates one.
 *
 * When a factory ({@link ConfigBuilderCallback}) is supplied, it receives
 * {@link ConfigBuilderCallbackArgs} at resolution time so it can depend on
 * environment variables, other modules, or async setup.
 *
 * @template T - The service type to provide (e.g. {@link IModel}, {@link IEmbed}).
 */
export type ValueOrCallback<T> = T | ConfigBuilderCallback<T>;

/**
 * Resolved AI module configuration produced by {@link AIConfigurator}.
 *
 * Each record maps a user-chosen identifier to the fully-resolved service
 * instance.  This object is consumed by {@link AIProvider} at module
 * initialisation.
 */
export type AIModuleConfig = {
  /** Language model services keyed by identifier */
  models?: Record<string, IModel>;
  /** Text-embedding services keyed by identifier */
  embeddings?: Record<string, IEmbed>;
  /** Vector store (document search) services keyed by identifier */
  vectorStores?: Record<string, IVectorStore>;
};

/**
 * Resolves a service category key from {@link AIModuleConfig} to its concrete
 * service interface.
 *
 * @template T - The `AIModuleConfig` key (`'models'`, `'embeddings'`, or `'vectorStores'`).
 */
export type ConfiguredService<T extends keyof AIModuleConfig> = T extends 'models'
  ? IModel
  : T extends 'embeddings'
    ? IEmbed
    : T extends 'vectorStores'
      ? IVectorStore
      : never;

/**
 * Fluent configuration interface for the Fusion AI module.
 *
 * Implementations provide methods to register language models, embedding
 * services, and vector stores by identifier.  Each service can be supplied
 * either as a ready-to-use instance (eager initialisation) or as a factory
 * function (lazy initialisation).
 */
export interface IAIConfigurator {
  /**
   * Register a language model service.
   *
   * @param identifier - Unique name used to retrieve the model at runtime.
   * @param modelOrFactory - An {@link IModel} instance or a factory that creates one.
   * @returns This configurator for method chaining.
   */
  setModel(identifier: string, modelOrFactory: ValueOrCallback<IModel>): this;

  /**
   * Register a text-embedding service.
   *
   * @param identifier - Unique name used to retrieve the embedding service at runtime.
   * @param embeddingOrFactory - An {@link IEmbed} instance or a factory that creates one.
   * @returns This configurator for method chaining.
   */
  setEmbedding(identifier: string, embeddingOrFactory: ValueOrCallback<IEmbed>): this;

  /**
   * Register a vector store (document search) service.
   *
   * @param identifier - Unique name used to retrieve the vector store at runtime.
   * @param vectorStoreOrFactory - An {@link IVectorStore} instance or a factory that creates one.
   * @returns This configurator for method chaining.
   */
  setVectorStore(identifier: string, vectorStoreOrFactory: ValueOrCallback<IVectorStore>): this;

  /**
   * Retrieve a previously registered service by category and identifier.
   *
   * @template T - The service category key.
   * @param type - Service category (`'models'`, `'embeddings'`, or `'vectorStores'`).
   * @param identifier - The identifier supplied when the service was registered.
   * @returns The service instance (or factory) registered under the given key.
   */
  getService<T extends keyof AIModuleConfig>(type: T, identifier: string): ConfiguredService<T>;
}
