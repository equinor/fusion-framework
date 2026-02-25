import type { ApiResolved } from '../api-models';
import type { ClientMethod } from '../../types';

export type ApiResponse = ApiResolved;

export type ApiResult<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse,
> = ClientMethod<TResult>[TMethod];
