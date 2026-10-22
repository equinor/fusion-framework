import { afterEach, describe, expect, it, vi } from 'vitest';
import { concat, from, Observable, throwError } from 'rxjs';
import { RunnableLambda, RunnableSequence, type RunnableConfig } from '@langchain/core/runnables';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type ITelemetryProvider,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { BaseService } from '../lib/BaseService.js';
import { STRATEGY_TYPE } from '../lib/strategies/static.js';
import type { Strategy } from '../lib/strategies/types.js';
import type { IEmbed, IModel, IVectorStore } from '../lib/types.js';
import { AiProvider } from '../AiProvider.js';
import { enableAI, type AiModule } from '../module.js';

const SENTINEL = 'PRIVACY_SENTINEL';

afterEach(() => vi.restoreAllMocks());

/** Custom-strategy model with private state, streaming chunks and LangChain-like abort. */
class FakeModel extends BaseService<string, string> {
  readonly #chunks: string[];
  readonly #failure?: Error;
  readonly #hang: boolean;
  /** Placeholder for the `IModel.llm` contract. */
  readonly llm = {};
  /** Number of `invoke$` executions started on the original client. */
  subscriptions = 0;

  /**
   * @param chunks - Chunks emitted by every execution.
   * @param options - Optional terminal failure, or hang until aborted.
   */
  constructor(chunks: string[], options: { failure?: Error; hang?: boolean } = {}) {
    super();
    this.#chunks = chunks;
    this.#failure = options.failure;
    this.#hang = options.hang ?? false;
  }

  /**
   * @param _input - Ignored prompt.
   * @param options - Abort signal honoured by hanging executions.
   * @returns Chunks, then completion, failure or abort.
   */
  invoke$(_input: string, options?: RunnableConfig): Observable<string> {
    this.subscriptions++;
    const chunks = from(this.#chunks);
    // Failing executions error after their chunks.
    if (this.#failure) {
      return concat(
        chunks,
        throwError(() => this.#failure),
      );
    }
    // Non-hanging executions complete after their chunks.
    if (!this.#hang) {
      return chunks;
    }
    return new Observable<string>((subscriber) => {
      // Emit synchronously, then wait for abort like a LangChain model.
      for (const chunk of this.#chunks) subscriber.next(chunk);
      options?.signal?.addEventListener('abort', () => subscriber.error(new Error('Aborted')));
    });
  }

  /** @returns A tool-bound runnable whose output contains a privacy sentinel. */
  bindTools(): RunnableLambda<string, string> {
    return RunnableLambda.from(async (input: string) => `${input}:${SENTINEL}-tool-result`);
  }
}

/** Custom client whose own `batch` relies on private state. */
class PrivateBatchModel extends FakeModel {
  readonly #prefix = 'private';
  /**
   * @param inputs - Prompts.
   * @returns Prefixed prompts, computed without invoking the model.
   */
  async batch(inputs: string[]): Promise<string[]> {
    return Array.from(inputs, (input) => `${this.#prefix}:${input}`);
  }
}

/** Custom-strategy embed client counting its executions. */
class FakeEmbed extends BaseService<string[], number[][]> {
  /** Executions on the original client. */
  calls = 0;
  /** Embeds one text. */
  embedQuery = async (_document: string): Promise<number[]> => {
    this.calls++;
    return [0.42];
  };
  /** Embeds many texts, one fixed vector per input. */
  embedDocuments = async (documents: string[]): Promise<number[][]> => {
    this.calls++;
    return Array.from(documents, () => [0.42]);
  };
  /**
   * @param documents - Texts to embed.
   * @returns The embedding vectors.
   */
  invoke$(documents: string[]): Observable<number[][]> {
    return from(this.embedDocuments(documents));
  }
}

/** Custom-strategy store that embeds each query, like Azure AI Search. */
class FakeStore extends BaseService<string, unknown[]> {
  /** @param embed - Embed client supplied by the provider. */
  constructor(readonly embed: IEmbed) {
    super();
  }
  /**
   * @param query - Search text.
   * @returns One document whose content is a privacy sentinel.
   */
  async invoke(query: string): Promise<unknown[]> {
    await this.embed.embedQuery(query);
    return [{ pageContent: `${SENTINEL}-document` }];
  }
  /**
   * @param query - Search text.
   * @returns The search results.
   */
  invoke$(query: string): Observable<unknown[]> {
    return from(this.invoke(query));
  }
  /** @returns A retriever searching the original store. */
  asRetriever(): RunnableLambda<string, unknown[]> {
    return RunnableLambda.from((query: string) => this.invoke(query));
  }
  /** @returns No stored IDs. */
  async addDocuments(): Promise<string[]> {
    return [];
  }
  /** Deletes nothing. */
  async deleteDocuments(): Promise<void> {}
}

// The fakes implement the client surfaces these tests use, not the full LangChain types.
const asModel = (model: FakeModel): IModel => model as unknown as IModel;
// The store fake implements only the IVectorStore members exercised here.
const asStore = (store: FakeStore): IVectorStore => store as unknown as IVectorStore;

const embedClient = new FakeEmbed();
let nextModel: FakeModel = new FakeModel(['a']);

const strategies: Strategy[] = [
  {
    name: 'custom',
    type: STRATEGY_TYPE.MODEL,
    createModel: () => asModel(nextModel),
  },
  { name: 'fusion-ai-embed-strategy', type: STRATEGY_TYPE.EMBED, createClient: () => embedClient },
  {
    name: 'custom-index',
    type: STRATEGY_TYPE.INDEX,
    createStore: (embed) => asStore(new FakeStore(embed)),
  },
];

const createTelemetry = (track = vi.fn<(item: TelemetryItem) => void>()) => {
  // Only the members used by the AI reporter are faked.
  const telemetry = {
    source: { source: 'app', hostId: 'host-1' },
    track,
    trackEvent: vi.fn(),
  } as unknown as ITelemetryProvider;
  return { track, telemetry };
};

const setup = async () => {
  const { track, telemetry } = createTelemetry();
  const provider = new AiProvider({ strategies } as never);
  await provider.connectTelemetry(telemetry);
  const model = (chunks: string[], options?: ConstructorParameters<typeof FakeModel>[1]) => {
    nextModel = new FakeModel(chunks, options);
    return provider.useModel('deployment', { strategy: 'custom' });
  };
  const setupModelFromNext = () =>
    provider.useModel('deployment', { strategy: 'custom' }).stream('q');
  const outcomes = (): string[] => {
    const names: string[] = [];
    // One `name:outcome` entry per tracked record.
    for (const [item] of track.mock.calls) names.push(`${item.name}:${item.diagnostic?.outcome}`);
    return names;
  };
  return { provider, track, model, outcomes, setupModelFromNext };
};

describe('AI execution telemetry', () => {
  it('reports one terminal record per invoke and returns the original result', async () => {
    const { model, outcomes, track } = await setup();
    const llm = model(['one', 'two']);

    await expect(llm.invoke(SENTINEL)).resolves.toBe('two');

    expect(outcomes()).toEqual(['fusion.ai.model-invoke.duration:success']);
    expect(track.mock.calls[0][0]).toMatchObject({
      type: 'metric',
      value: expect.any(Number),
      diagnostic: { module: 'ai', operation: 'model-invoke', unit: 'ms', hostId: 'host-1' },
    });
    // The default invoke delegates to invoke$ on the original client: no layered duplicate.
    expect(nextModel.subscriptions).toBe(1);
  });

  it('reports failures once with a controlled exception and rethrows the original error', async () => {
    const { model, outcomes, track } = await setup();
    const error = new Error(`${SENTINEL} completion failed`);

    await expect(model(['partial'], { failure: error }).invoke(SENTINEL)).rejects.toBe(error);

    expect(outcomes()).toEqual([
      'fusion.ai.model-invoke.duration:failure',
      'fusion.ai.model-invoke.failure:failure',
    ]);
    expect(JSON.stringify(track.mock.calls)).not.toContain(SENTINEL);
  });

  it('classifies an aborted invocation as cancelled, not failed', async () => {
    const { model, outcomes } = await setup();
    const controller = new AbortController();
    const pending = model(['a'], { hang: true }).invoke(SENTINEL, { signal: controller.signal });

    controller.abort();

    await expect(pending).rejects.toThrow('Aborted');
    expect(outcomes()).toEqual(['fusion.ai.model-invoke.duration:cancelled']);
  });

  it('measures an observable stream until its terminal outcome without per-chunk records', async () => {
    const { model, outcomes } = await setup();
    const chunks = Array.from({ length: 50 }, (_, index) => `${SENTINEL}-${index}`);
    const received: unknown[] = [];

    await new Promise<void>((resolve) => {
      model(chunks)
        .invoke$(SENTINEL)
        .subscribe({ next: (c) => received.push(c), complete: resolve });
    });

    expect(received).toEqual(chunks);
    expect(outcomes()).toEqual(['fusion.ai.model-stream.duration:success']);
  });

  it('reports observable stream errors and unsubscription distinctly', async () => {
    const { model, outcomes } = await setup();
    const error = new Error('stream broke');

    await new Promise<void>((resolve) => {
      model(['a'], { failure: error })
        .invoke$('q')
        .subscribe({ error: () => resolve() });
    });
    const subscription = model(['a'], { hang: true }).invoke$('q').subscribe();
    subscription.unsubscribe();
    subscription.unsubscribe();

    expect(outcomes()).toEqual([
      'fusion.ai.model-stream.duration:failure',
      'fusion.ai.model-stream.failure:failure',
      'fusion.ai.model-stream.duration:cancelled',
    ]);
  });

  it('keeps LangChain stream() a readable stream and measures consumption', async () => {
    const { model, outcomes } = await setup();

    const stream = await model(['a', 'b', 'c']).stream('q');
    expect(stream).toBeInstanceOf(IterableReadableStream);
    const received: unknown[] = [];
    // Consume the whole stream like an application would.
    for await (const chunk of stream) received.push(chunk);

    const early = await model(['x', 'y', 'z']).stream('q');
    // Stop after the first chunk: the consumer cancels the stream.
    for await (const _chunk of early) break;

    expect(received).toEqual(['a', 'b', 'c']);
    expect(outcomes()).toEqual([
      'fusion.ai.model-stream.duration:success',
      'fusion.ai.model-stream.duration:cancelled',
    ]);
  });

  it('reports stream failures without leaking chunk or error content', async () => {
    const { model, outcomes, track, setupModelFromNext } = await setup();
    const error = new Error(`${SENTINEL}-error`);
    model(['unused']);
    // A rejecting iterator, as LangChain chat model streams produce on transport errors.
    nextModel._streamIterator = async function* () {
      yield `${SENTINEL}-chunk`;
      throw error;
    };
    const stream = await setupModelFromNext();
    const consume = async () => {
      // Drain until the stream rejects.
      for await (const _chunk of stream);
    };

    await expect(consume()).rejects.toBe(error);
    expect(outcomes()).toEqual([
      'fusion.ai.model-stream.duration:failure',
      'fusion.ai.model-stream.failure:failure',
    ]);
    expect(JSON.stringify(track.mock.calls)).not.toContain(SENTINEL);
  });

  it('covers tool-bound runnables and LangChain composition', async () => {
    const { model, outcomes, track } = await setup();
    const llm = model(['answer']);

    await expect(llm.bindTools([]).invoke(SENTINEL)).resolves.toContain('tool-result');
    // LangChain chains call the instrumented client's own invoke.
    const chain = RunnableSequence.from([
      llm,
      RunnableLambda.from((x: unknown) => String(x).length),
    ]);
    await expect(chain.invoke('q')).resolves.toBe(6);
    await llm.batch(['a', 'b']);

    expect(outcomes()).toEqual([
      'fusion.ai.model-invoke.duration:success',
      'fusion.ai.model-invoke.duration:success',
      'fusion.ai.model-invoke.duration:success',
      'fusion.ai.model-invoke.duration:success',
    ]);
    expect(JSON.stringify(track.mock.calls)).not.toContain(SENTINEL);
  });

  it('reports embeddings and searches once each without vectors or documents', async () => {
    const { provider, outcomes, track } = await setup();
    const embed = provider.useEmbed();
    const index = provider.useIndex('docs', { strategy: 'custom-index' });

    await embed.embedQuery(SENTINEL);
    await embed.embedDocuments([SENTINEL]);
    await embed.invoke([SENTINEL]);
    const before = embedClient.calls;
    await expect(index.invoke(SENTINEL)).resolves.toHaveLength(1);
    await index.asRetriever().invoke(SENTINEL);

    // Each search embeds its query through the uninstrumented client: one record per search.
    expect(embedClient.calls - before).toBe(2);
    expect(outcomes()).toEqual([
      'fusion.ai.embed.duration:success',
      'fusion.ai.embed.duration:success',
      'fusion.ai.embed.duration:success',
      'fusion.ai.search.duration:success',
      'fusion.ai.search.duration:success',
    ]);
    const exported = JSON.stringify(track.mock.calls);
    expect(exported).not.toContain(SENTINEL);
    expect(exported).not.toContain('0.42');
    expect(exported).not.toContain('docs');
    expect(exported).not.toContain('deployment');
  });

  it('keeps the original receiver for custom members that use private state', async () => {
    const { provider, track } = await setup();
    nextModel = new PrivateBatchModel(['a']);
    const llm = provider.useModel('m', { strategy: 'custom' });

    await expect(llm.batch(['x', 'y'])).resolves.toEqual(['private:x', 'private:y']);
    // A custom batch is not a measured entry point, and nothing broke with telemetry on.
    expect(track).not.toHaveBeenCalled();
    await expect(llm.invoke('q')).resolves.toBe('a');
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('leaves inherited object members such as constructor and toString untouched', async () => {
    const { model, track } = await setup();
    const llm = model(['a']);

    expect(llm.constructor).toBe(FakeModel);
    expect(llm.toString()).toBe(nextModel.toString());
    expect(llm.valueOf()).not.toBeInstanceOf(Promise);
    expect(track).not.toHaveBeenCalled();
  });

  it('returns the strategy client untouched when telemetry is not connected', () => {
    const provider = new AiProvider({ strategies } as never);
    nextModel = new FakeModel(['a']);

    expect(provider.useModel('m', { strategy: 'custom' })).toBe(nextModel);
    expect(provider.useEmbed()).toBe(embedClient);
  });

  it('preserves AI results when telemetry delivery fails, warning once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { telemetry } = createTelemetry(
      vi.fn(() => {
        throw new Error(SENTINEL);
      }),
    );
    const provider = new AiProvider({ strategies } as never);
    await provider.connectTelemetry(telemetry);
    nextModel = new FakeModel(['ok']);
    const llm = provider.useModel('m', { strategy: 'custom' });

    await expect(llm.invoke('q')).resolves.toBe('ok');
    await expect(llm.invoke('q')).resolves.toBe('ok');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls)).not.toContain(SENTINEL);
  });

  it('ignores a connection superseded while its reporter loads', async () => {
    const { track, telemetry } = createTelemetry();
    const provider = new AiProvider({ strategies } as never);
    const loading = provider.connectTelemetry(telemetry);
    await provider.connectTelemetry(undefined);
    await loading;
    nextModel = new FakeModel(['a']);

    expect(provider.useModel('m', { strategy: 'custom' })).toBe(nextModel);
    await nextModel.invoke('q');
    expect(track).not.toHaveBeenCalled();
  });

  it('stops reporting after the provider is disposed', async () => {
    const { provider, model, track } = await setup();
    const llm = model(['a']);

    provider.dispose();

    await expect(llm.invoke('q')).resolves.toBe('a');
    expect(track).not.toHaveBeenCalled();
  });
});

describe('AI module telemetry wiring', () => {
  const fakeModules = (config: ModulesConfigurator) => {
    config.addConfig({
      module: { name: 'auth', initialize: () => ({ acquireAccessToken: vi.fn() }) },
    });
    config.addConfig({
      module: {
        name: 'serviceDiscovery',
        initialize: () => ({ resolveService: async () => ({ uri: 'http://ai.invalid' }) }),
      },
    });
  };

  it('connects host telemetry after initialization and exports only safe records', async () => {
    const processItem = vi.fn();
    const config = new ModulesConfigurator();
    fakeModules(config);
    enableTelemetry(config, {
      attachConfiguratorEvents: false,
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    enableAI(config, (ai) => ai.addStrategy(strategies[0]));
    const modules = await config.initialize<[TelemetryModule, AiModule]>();
    nextModel = new FakeModel(['done']);

    await modules.ai.useModel('m', { strategy: 'custom' }).invoke(SENTINEL);
    await vi.waitFor(() => {
      // Compare exported record names only.
      const names = processItem.mock.calls.map(([item]) => item.name);
      expect(names).toContain('fusion.ai.model-invoke.duration');
    });
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);

    await modules.dispose();
  });

  it('runs AI without a telemetry module', async () => {
    const config = new ModulesConfigurator();
    fakeModules(config);
    enableAI(config, (ai) => ai.addStrategy(strategies[0]));
    const modules = await config.initialize<[AiModule]>();
    nextModel = new FakeModel(['done']);

    const llm = modules.ai.useModel('m', { strategy: 'custom' });
    expect(llm).toBe(nextModel);
    await expect(llm.invoke('q')).resolves.toBe('done');

    await modules.dispose();
  });
});
