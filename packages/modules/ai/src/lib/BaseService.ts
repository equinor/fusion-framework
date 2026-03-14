import { lastValueFrom } from 'rxjs';
import { Runnable, type RunnableInterface, type RunnableConfig } from '@langchain/core/runnables';
import type { IService } from './types.js';
import { toAsyncIterable } from './toAsyncIterator.js';

/**
 * Abstract base class for Fusion AI services.
 *
 * Provides default implementations of {@link IService.invoke} (single-response)
 * and `_streamIterator` (async-generator streaming) built on top of the
 * abstract {@link BaseService.invoke$ | invoke$} observable that subclasses must implement.
 *
 * Extends the LangChain {@link Runnable} so every service can participate in
 * LangChain chain composition out of the box.
 *
 * @template TInput  - Input type accepted by the service.
 * @template TOutput - Output type produced by the service.
 * @template TOptions - Runnable configuration options.
 */
export abstract class BaseService<TInput, TOutput, TOptions extends RunnableConfig = RunnableConfig>
  extends Runnable<TInput, TOutput, TOptions>
  implements IService<TInput, TOutput, TOptions>
{
  /** LangChain namespace used for serialisation and tracing. */
  lc_namespace = ['@equinor', 'fusion-framework-module-ai'];

  /**
   * Default invoke implementation that converts streaming to single response
   * @param input - Input data for the service
   * @param options - Optional configuration
   * @returns Promise resolving to the result
   */
  async invoke(input: TInput, options?: TOptions): Promise<TOutput> {
    return lastValueFrom(this.invoke$(input, options));
  }

  /**
   * Abstract method for streaming implementation
   * @param input - Input data for the service
   * @returns Observable stream of results
   */
  abstract invoke$(
    input: TInput,
    options?: TOptions,
  ): ReturnType<IService<TInput, TOutput>['invoke$']>;

  /**
   * Default streaming implementation using invoke$
   * @param input - Input data for the service
   * @param options - Optional configuration
   * @returns AsyncGenerator for streaming responses
   */
  async *_streamIterator(input: TInput, options?: TOptions): AsyncGenerator<TOutput> {
    yield* toAsyncIterable(this.invoke$(input, options));
  }

  /**
   * Return this service typed as a LangChain `RunnableInterface`.
   *
   * Useful when passing the service into LangChain pipeline builders that
   * require the `RunnableInterface` type explicitly.
   *
   * @returns This instance as a {@link RunnableInterface}.
   */
  asRunnable(): RunnableInterface<TInput, TOutput, TOptions> {
    return this;
  }
}
