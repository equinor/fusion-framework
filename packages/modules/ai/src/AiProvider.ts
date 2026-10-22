import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IModel, IEmbed, IVectorStore } from './lib/types.js';
import { version } from './version.js';
import type { AIModuleConfig } from './AiConfigurator.js';
import {
  FUSION_EMBED_STRATEGY_NAME,
  FUSION_INDEX_STRATEGY_NAME,
  FUSION_MODEL_STRATEGY_NAME,
  STRATEGY_TYPE,
} from './lib/strategies/index.js';
import type { EmbedStrategy, ModelStrategy, Strategy } from './lib/strategies/index.js';
import type { AiOperation, AiReport } from './telemetry/create-ai-reporter.js';
import { type InstrumentationPlan, instrumentAiClient } from './telemetry/instrument-ai-client.js';
import type { ExecutionKind } from './telemetry/measure-execution.js';

/**
 * @internal Creates a recursive execution plan for LangChain runnables and their bindings.
 * @returns Plans that measure execution and wrap new bindings returned by configuration methods.
 */
const createModelRunnablePlan = (): InstrumentationPlan => {
  const plan: Record<
    string,
    | { readonly kind: ExecutionKind; readonly operation: AiOperation }
    | { readonly returns: InstrumentationPlan }
  > = {
    invoke: { kind: 'promise', operation: 'model-invoke' },
    batch: { kind: 'promise', operation: 'model-invoke' },
    invoke$: { kind: 'observable', operation: 'model-stream' },
    stream: { kind: 'stream', operation: 'model-stream' },
    transform: { kind: 'generator', operation: 'model-stream' },
  };
  // Configuration methods construct a new runnable; recursively instrument that binding too.
  plan.withConfig = { returns: plan };
  plan.withRetry = { returns: plan };
  return plan;
};

const modelRunnablePlan = createModelRunnablePlan();

/** @internal Models also instrument the runnables returned by tool binding. */
const modelPlan: InstrumentationPlan = {
  ...modelRunnablePlan,
  bindTools: { returns: createModelRunnablePlan() },
};

/** @internal Embedding executions, whichever entry point is used. */
const embedPlan: InstrumentationPlan = {
  invoke: { kind: 'promise', operation: 'embed' },
  invoke$: { kind: 'observable', operation: 'embed' },
  embedQuery: { kind: 'promise', operation: 'embed' },
  embedDocuments: { kind: 'promise', operation: 'embed' },
};

/** @internal Searches through the store or through a LangChain retriever created from it. */
const indexPlan: InstrumentationPlan = {
  invoke: { kind: 'promise', operation: 'search' },
  invoke$: { kind: 'observable', operation: 'search' },
  asRetriever: { returns: { invoke: { kind: 'promise', operation: 'search' } } },
};

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

  /**
   * Connects optional host telemetry for AI execution diagnostics.
   *
   * Called by the module after initialization. Clients created afterwards report
   * `fusion.ai.<operation>.duration` outcomes; `undefined` leaves clients uninstrumented.
   * @param telemetry - Available host telemetry provider.
   * @returns Resolves once diagnostics are active, or immediately without telemetry.
   */
  connectTelemetry?(telemetry: ITelemetryProvider | undefined): Promise<void>;
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
  #telemetry?: ITelemetryProvider;
  #report?: AiReport;
  /** Increments on every (re)connection and on disposal, so stale async connections stop. */
  #connection = 0;

  /**
   * @param config - Resolved AI module configuration with service URI and token factory.
   */
  constructor(config: AIModuleConfig) {
    super({ version, config });
    this.#strategies = config.strategies ?? [];
    // Executions finishing after disposal must not report to a torn-down host.
    this._addTeardown(() => {
      this.#connection++;
      this.#telemetry = undefined;
      this.#report = undefined;
    });
  }

  /**
   * {@inheritDoc IAiProvider.connectTelemetry}
   *
   * The reporter depends on the optional telemetry peer, so it is loaded only when a provider
   * is given; without telemetry the peer is never imported.
   */
  public async connectTelemetry(telemetry: ITelemetryProvider | undefined): Promise<void> {
    const connection = ++this.#connection;
    this.#telemetry = undefined;
    this.#report = undefined;
    // Without telemetry, clients stay exactly as the strategies create them.
    if (!telemetry) {
      return;
    }
    let createAiReporter: (telemetry: () => ITelemetryProvider | undefined) => AiReport;
    try {
      ({ createAiReporter } = await import('./telemetry/create-ai-reporter.js'));
    } catch {
      console.warn('AI operational telemetry is unavailable');
      return;
    }
    // A later connection, disconnection or disposal supersedes this one.
    if (connection !== this.#connection) {
      return;
    }
    this.#telemetry = telemetry;
    this.#report = createAiReporter(() => this.#telemetry);
  }

  /**
   * Instruments a strategy-created client while telemetry is connected.
   * Without telemetry the strategy's own client is returned untouched.
   *
   * @template T - Client type.
   * @param client - Client created by a built-in or custom strategy.
   * @param plan - Execution methods to measure.
   * @returns The instrumented client, or `client` itself without telemetry.
   */
  #instrument<T>(client: T, plan: InstrumentationPlan): T {
    const report = this.#report;
    return report ? instrumentAiClient(client, plan, report) : client;
  }

  /** {@inheritDoc IAiProvider.useModel} */
  public useModel(model: string = DEFAULT_MODEL, options?: { strategy?: string }): IModel {
    const strategyName = options?.strategy ?? FUSION_MODEL_STRATEGY_NAME;
    // Locate the registered strategy matching the requested name and type
    const strategy = this.#strategies.find(
      (s): s is ModelStrategy => s.name === strategyName && s.type === STRATEGY_TYPE.MODEL,
    );
    // Fail fast when the requested strategy was never registered
    if (!strategy) {
      throw new Error(`Model strategy "${strategyName}" not found in configuration`);
    }
    return this.#instrument(strategy.createModel(model), modelPlan);
  }

  /** {@inheritDoc IAiProvider.useEmbed} */
  public useEmbed(model: string = DEFAULT_EMBED_MODEL, options?: { strategy?: string }): IEmbed {
    return this.#instrument(this.#createEmbed(model, options), embedPlan);
  }

  /**
   * Creates an uninstrumented embed client; searches measure their own embedding work.
   *
   * @param model - Embedding deployment name.
   * @param options - Optional strategy selector.
   * @returns The strategy's embed client.
   * @throws {Error} When the requested embed strategy is not registered.
   */
  #createEmbed(model: string, options?: { strategy?: string }): IEmbed {
    const strategyName = options?.strategy ?? FUSION_EMBED_STRATEGY_NAME;
    // Locate the registered strategy matching the requested name and type
    const strategy = this.#strategies.find(
      (s): s is EmbedStrategy => s.name === strategyName && s.type === STRATEGY_TYPE.EMBED,
    );
    // Fail fast when the requested strategy was never registered
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
    // Locate the registered strategy matching the requested name and type
    const strategy = this.#strategies.find(
      (s): s is Extract<Strategy, { type: typeof STRATEGY_TYPE.INDEX }> =>
        s.name === strategyName && s.type === STRATEGY_TYPE.INDEX,
    );
    // Fail fast when the requested strategy was never registered
    if (!strategy) {
      throw new Error(`Index strategy "${strategyName}" not found in configuration`);
    }
    const embedModel = opts?.embedModel ?? DEFAULT_EMBED_MODEL;
    // The search record covers its query embedding, so one search reports exactly once.
    const embedClient = this.#createEmbed(embedModel, { strategy: FUSION_EMBED_STRATEGY_NAME });
    return this.#instrument(strategy.createStore(embedClient, indexName), indexPlan);
  }
}
