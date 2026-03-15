/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  actionSuffixDivider,
  createAction,
  matchActionSuffix,
  type PayloadActionCreator,
} from './create-action';

import type { PrepareAction } from './create-action';
import type { Action, ActionWithSuffix, AnyAction } from './types';

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

export function createAsyncAction(
  type: string,
  request: PrepareAction<any>,
  success: PrepareAction<any>,
  failure?: PrepareAction<any>,
): any {
  const action = createAction([type, 'request'].join(actionSuffixDivider), request);
  if (success) {
    Object.assign(action, {
      success: createAction([type, 'success'].join(actionSuffixDivider), success),
    });
  }
  if (failure) {
    Object.assign(action, {
      failure: createAction([type, 'failure'].join(actionSuffixDivider), failure),
    });
  }
  return action as unknown as any;
}

/**
 * Type guard that checks whether an action has a specific suffix in its type string.
 *
 * @template A - The action type.
 * @template Suffix - The expected suffix string.
 * @param action - The action to check.
 * @param suffix - The suffix to look for (e.g., `'request'`, `'success'`, `'failure'`).
 * @returns `true` if the action type ends with `::suffix`.
 */
export function isActionWithSuffix<A extends Action, Suffix extends string>(
  action: A,
  suffix: Suffix,
): action is ActionWithSuffix<A, Suffix> {
  return !!action.type.match(matchActionSuffix(suffix));
}

/**
 * Type guard that returns `true` if the action is a `::request` action.
 *
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::request`.
 */
export const isRequestAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'request'> => isActionWithSuffix(action, 'request');

/**
 * Type guard that returns `true` if the action is a `::success` action.
 *
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::success`.
 */
export const isSuccessAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'success'> => isActionWithSuffix(action, 'success');

/**
 * Type guard that returns `true` if the action is a `::failure` action.
 *
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::failure`.
 */
export const isFailureAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'failure'> => isActionWithSuffix(action, 'failure');

/**
 * Type guard that returns `true` if the action is either a `::success` or `::failure` action.
 *
 * @param action - The action to check.
 * @returns `true` if the action is a completion action.
 */
export const isCompleteAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'success' | 'failure'> =>
  isSuccessAction(action) || isFailureAction(action);
