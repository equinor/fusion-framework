import type { ApiSuggestions } from '../api-models';
import type { ClientMethod } from '../../types';

export type ApiResponse = ApiSuggestions;

export type ApiResult<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse,
> = ClientMethod<TResult>[TMethod];
