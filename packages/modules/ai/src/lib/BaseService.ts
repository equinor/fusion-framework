import { lastValueFrom } from 'rxjs';
import { Runnable, RunnableInterface, type RunnableConfig } from '@langchain/core/runnables';
import type { IService } from './types.js';
import { toAsyncIterable } from './toAsyncIterator.js';

export abstract class BaseService<TInput, TOutput, TOptions extends RunnableConfig = RunnableConfig>
  extends Runnable<TInput, TOutput, TOptions>
  implements IService<TInput, TOutput, TOptions>
{
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
  abstract invoke$(input: TInput, options?: TOptions): ReturnType<IService<TInput, TOutput>['invoke$']>;

  /**
   * Default streaming implementation using invoke$
   * @param input - Input data for the service  
   * @param options - Optional configuration
   * @returns AsyncGenerator for streaming responses
   */
  async *_streamIterator(input: TInput, options?: TOptions): AsyncGenerator<TOutput> {
    yield* toAsyncIterable(this.invoke$(input, options));
  }
  
  asRunnable(): RunnableInterface<TInput, TOutput, TOptions> {
    return this;
  }
}
