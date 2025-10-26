import { lastValueFrom } from 'rxjs';
import { Runnable } from '@langchain/core/runnables';
import type { IService } from './types.js';
import { toAsyncIterable } from './toAsyncIterator.js';

export abstract class BaseService<TInput, TOutput> extends Runnable<TInput, TOutput> implements IService<TInput, TOutput> {
  lc_namespace = ['@equinor', 'fusion-framework-module-ai'];

  /**
   * Default invoke implementation that converts streaming to single response
   * @param input - Input data for the service
   * @param options - Optional configuration
   * @returns Promise resolving to the result
   */
  async invoke(input: TInput, _options?: any): Promise<TOutput> {
    return lastValueFrom(this.invoke$(input));
  }

  /**
   * Abstract method for streaming implementation
   * @param input - Input data for the service
   * @returns Observable stream of results
   */
  abstract invoke$(input: TInput): ReturnType<IService<TInput, TOutput>['invoke$']>;

  /**
   * Default streaming implementation using invoke$
   * @param input - Input data for the service
   * @param options - Optional configuration
   * @returns AsyncGenerator for streaming responses
   */
  async *_streamIterator(input: TInput, _options?: any): AsyncGenerator<TOutput> {
    yield* toAsyncIterable(this.invoke$(input));
  }
}
