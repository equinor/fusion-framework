import type { STRATEGY_TYPE } from './static.js';
import type { IVectorStore, IModel, IEmbed } from '../types.js';

/** Common shape shared by all strategy types. */
export interface BaseStrategy {
  /** Unique name used to look up this strategy at runtime. */
  name: string;
  /** Discriminator indicating the capability this strategy provides. */
  type: (typeof STRATEGY_TYPE)[keyof typeof STRATEGY_TYPE];
}

/** Strategy that creates language model clients. */
export interface ModelStrategy extends BaseStrategy {
  type: typeof STRATEGY_TYPE.MODEL;
  /** Creates a new {@link IModel} for the given deployment name. */
  createModel: (model: string) => IModel;
}

/** Strategy that creates text-embedding clients. */
export interface EmbedStrategy extends BaseStrategy {
  type: typeof STRATEGY_TYPE.EMBED;
  /** Creates a new {@link IEmbed} for the given deployment name. */
  createClient: (model?: string) => IEmbed;
}

/** Strategy that creates vector store (document search) clients. */
export interface IndexStrategy extends BaseStrategy {
  type: typeof STRATEGY_TYPE.INDEX;
  /** Creates a new {@link IVectorStore} wired to the given embedder and index. */
  createStore: (embed: IEmbed, indexName: string) => IVectorStore;
}

/** Union of all valid strategy type values (e.g. `'model' | 'embed' | 'index'`). */
export type StrategyType = (typeof STRATEGY_TYPE)[keyof typeof STRATEGY_TYPE];

/**
 * Conditional type mapping a {@link StrategyType} discriminator to its
 * corresponding strategy interface.
 */
export type Strategy<T extends StrategyType = StrategyType> = T extends typeof STRATEGY_TYPE.MODEL
  ? ModelStrategy
  : T extends typeof STRATEGY_TYPE.EMBED
    ? EmbedStrategy
    : T extends typeof STRATEGY_TYPE.INDEX
      ? IndexStrategy
      : never;
