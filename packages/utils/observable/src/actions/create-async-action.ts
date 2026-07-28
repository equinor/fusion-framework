/* eslint-disable @typescript-eslint/no-explicit-any */

import { actionSuffixDivider, createAction } from './create-action';
import { isActionWithSuffix } from './is-action-with-suffix';
import { isCompleteAction } from './is-complete-action';
import { isFailureAction } from './is-failure-action';
import { isRequestAction } from './is-request-action';
import { isSuccessAction } from './is-success-action';
import type { PayloadActionCreator } from './create-action';

import type { PrepareAction } from './create-action';

/**
 * Creates an async action creator that produces request, success, and optionally failure sub-actions.
 *
 * The returned action creator dispatches a `request` action (suffixed with `::request`),
 * and has `.success` (suffixed with `::success`) and optionally `.failure` (suffixed with `::failure`)
 * action creator properties attached.
 *
 * @param type - The base action type string.
 * @param request - A prepare function for the `request` action payload.
 * @param success - A prepare function for the `success` action payload.
 * @returns An action creator for requests, with a `.success` property.
 *
 * @example
 * ```ts
 * import { createAsyncAction } from '@equinor/fusion-observable';
 *
 * const fetchUser = createAsyncAction(
 *   'fetchUser',
 *   (id: string) => ({ payload: { id } }),
 *   (user: User) => ({ payload: user }),
 * );
 *
 * dispatch(fetchUser('abc'));            // { type: 'fetchUser::request', payload: { id: 'abc' } }
 * dispatch(fetchUser.success(userData)); // { type: 'fetchUser::success', payload: userData }
 * ```
 */
export function createAsyncAction<
  PA extends PrepareAction<any>,
  PA_Success extends PrepareAction<any>,
  T extends string,
>(
  type: T,
  request: PA,
  success: PA_Success,
): PayloadActionCreator<ReturnType<PA>['payload'], `${T}::request`, PA> & {
  success: PayloadActionCreator<ReturnType<PA_Success>['payload'], `${T}::success`, PA_Success>;
};

export function createAsyncAction<
  PA extends PrepareAction<any>,
  PA_Success extends PrepareAction<any>,
  PA_Failure extends PrepareAction<any>,
  T extends string,
>(
  type: T,
  request: PA,
  success: PA_Success,
  failure: PA_Failure,
): PayloadActionCreator<ReturnType<PA>['payload'], `${T}::request`, PA> & {
  success: PayloadActionCreator<ReturnType<PA_Success>['payload'], `${T}::success`, PA_Success>;
  failure: PayloadActionCreator<ReturnType<PA_Failure>['payload'], `${T}::failure`, PA_Failure>;
};

/**
 * Creates the runtime async action implementation shared by the overloads above.
 *
 * @param type - The base action type string.
 * @param request - A prepare function for the request action payload.
 * @param success - A prepare function for the success action payload.
 * @param failure - An optional prepare function for the failure action payload.
 * @returns An action creator with request, success, and optional failure actions.
 */
export function createAsyncAction(
  type: string,
  request: PrepareAction<any>,
  success: PrepareAction<any>,
  failure?: PrepareAction<any>,
): any {
  const action = createAction([type, 'request'].join(actionSuffixDivider), request);
  // Attach the success action only when the caller supplied its prepare function.
  if (success) {
    // Add the success action while preserving the request creator's identity.
    Object.assign(action, {
      success: createAction([type, 'success'].join(actionSuffixDivider), success),
    });
  }
  // Attach the failure action only for async workflows that support failure results.
  if (failure) {
    // Add the failure action alongside the existing request and success actions.
    Object.assign(action, {
      failure: createAction([type, 'failure'].join(actionSuffixDivider), failure),
    });
  }
  // `action` is progressively mutated with `success`/`failure` properties above, so its static
  // type can't reflect the final shape declared by this function's overload signatures.
  return action as unknown as any;
}

export { isActionWithSuffix, isCompleteAction, isFailureAction, isRequestAction, isSuccessAction };
