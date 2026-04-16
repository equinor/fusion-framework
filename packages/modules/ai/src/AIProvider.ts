import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IModel, IEmbed, IVectorStore } from './lib/types.js';
import { version } from './version.js';
import type { AIModuleConfig } from './AIConfigurator.js';
import {
  FUSION_EMBED_STRATEGY_NAME,
  FUSION_INDEX_STRATEGY_NAME,
  FUSION_MODEL_STRATEGY_NAME,
  STRATEGY_TYPE,
} from './lib/strategies/index.js';
import type { EmbedStrategy, ModelStrategy, Strategy } from './lib/strategies/index.js';

/** @internal Default embedding model used when none is specified. */
const DEFAULT_EMBED_MODEL = 'text-embedding-3-large' as const;

/** @internal Default chat model deployment used when none is specified. */
const DEFAULT_MODEL = 'gpt-5.1-chat' as const;

/**
 * Public API surface of the Fusion AI provider.
 *
 * All three factory methods create a fresh client instance on each call,
 * binding them to the resolved service URI and MSAL token factory.
 */
export interface IAiProvider {
  /**
   * Creates a language model client backed by the Fusion AI service.
   *
   * @param model - Azure OpenAI deployment/model name (e.g. `'gpt-4.1'`).
   *   Defaults to `'gpt-5.1-chat'`.
   * @param options - Optional strategy selector.
   */
  useModel(model?: string, options?: { strategy?: string }): IModel;

  /**
   * Creates a text-embedding client backed by the Fusion AI service.
   *
   * @param model - Azure OpenAI deployment/model name.
   *   Defaults to `'text-embedding-3-large'`.
   * @param options - Optional strategy selector.
   */
  useEmbed(model?: string, options?: { strategy?: string }): IEmbed;

  /**
   * Creates an Azure AI Search vector store backed by the Fusion AI service.
   *
   * @param indexName - Name of the Azure AI Search index to use.
   * @param opts - Optional overrides for embedding model and strategy selection.
   */
  useIndex(indexName: string, opts?: { embedModel?: string; strategy?: string }): IVectorStore;
}

/**
 * Runtime implementation of the Fusion AI provider.
 *
 * Constructed automatically by the AI module initialiser with the resolved
 * Fusion AI service URI and a bound MSAL token factory.  Each factory method
 * returns a pre-configured Azure client wired to the same endpoint.
 *
 * @example
 * ```typescript
 * const model = modules.ai.useModel('gpt-4.1');
 * const reply = await model.invoke('Summarise this document');
 *
 * const embedder = modules.ai.useEmbed('text-embedding-3-large');
 * const vector = await embedder.embedQuery('Fusion Framework');
 *
 * const index = modules.ai.useIndex('framework');
 * const hits = await index.invoke('module initialisation');
 * ```
 */
export class AiProvider extends BaseModuleProvider<AIModuleConfig> implements IAiProvider {
  readonly #strategies: Strategy[];

  /**
   * @param config - Resolved AI module configuration with service URI and token factory.
   */
  constructor(config: AIModuleConfig) {
    super({ version, config });
    this.#strategies = config.strategies ?? [];
  }

  /** {@inheritDoc IAiProvider.useModel} */
  public useModel(model: string = DEFAULT_MODEL, options?: { strategy?: string }): IModel {
    const strategyName = options?.strategy ?? FUSION_MODEL_STRATEGY_NAME;
    const strategy = this.#strategies.find(
      (s): s is ModelStrategy => s.name === strategyName && s.type === STRATEGY_TYPE.MODEL,
    );
    if (!strategy) {
      throw new Error(`Model strategy "${strategyName}" not found in configuration`);
    }
    return strategy.createModel(model);
  }

  /** {@inheritDoc IAiProvider.useEmbed} */
  public useEmbed(model: string = DEFAULT_EMBED_MODEL, options?: { strategy?: string }): IEmbed {
    const strategyName = options?.strategy ?? FUSION_EMBED_STRATEGY_NAME;
    const strategy = this.#strategies.find(
      (s): s is EmbedStrategy => s.name === strategyName && s.type === STRATEGY_TYPE.EMBED,
    );
    if (!strategy) {
      throw new Error(`Embed strategy "${strategyName}" not found in configuration`);
    }
    return strategy.createClient(model);
  }

  /** {@inheritDoc IAiProvider.useIndex} */
  public useIndex(
    indexName: string,
    opts?: { embedModel?: string; strategy?: string },
  ): IVectorStore {
    const strategyName = opts?.strategy ?? FUSION_INDEX_STRATEGY_NAME;
    const strategy = this.#strategies.find(
      (s): s is Extract<Strategy, { type: typeof STRATEGY_TYPE.INDEX }> =>
        s.name === strategyName && s.type === STRATEGY_TYPE.INDEX,
    );
    if (!strategy) {
      throw new Error(`Index strategy "${strategyName}" not found in configuration`);
    }
    const embedModel = opts?.embedModel ?? DEFAULT_EMBED_MODEL;
    const embedClient = this.useEmbed(embedModel, { strategy: FUSION_EMBED_STRATEGY_NAME });
    return strategy.createStore(embedClient, indexName);
  }
}
