import type { ApiResolved } from '../api-models';
import type { ClientMethod } from '../../types';

/** Response type for the people resolve endpoint. */
export type ApiResponse = ApiResolved;

/**
 * Result type for the people resolve endpoint.
 *
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type ApiResult<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse,
> = ClientMethod<TResult>[TMethod];
