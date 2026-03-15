import type { ApiSuggestions } from '../api-models';
import type { ClientMethod } from '../../types';

/** Response type for the people suggest endpoint. */
export type ApiResponse = ApiSuggestions;

/**
 * Result type for the people suggest endpoint.
 *
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type ApiResult<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse,
> = ClientMethod<TResult>[TMethod];
