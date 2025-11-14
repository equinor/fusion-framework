import { from, lastValueFrom } from 'rxjs';
import type { IService } from './types';

export abstract class BaseService<TInput, TOutput> implements IService<TInput, TOutput> {
  public invoke(
    ...args: Parameters<IService<TInput, TOutput>['invoke']>
  ): ReturnType<IService<TInput, TOutput>['invoke']> {
    return lastValueFrom(this.invoke$(...args));
  }

  abstract invoke$(...args: Parameters<IService<TInput, TOutput>['invoke$']>): ReturnType<IService<TInput, TOutput>['invoke$']>;    
}
