/**
 * Barrel module that re-exports all action-related utilities and types.
 *
 * Import from `@equinor/fusion-observable/actions` to access action
 * creators, async-action helpers, and action type definitions.
 *
 * @module actions
 */
export * from './ActionError';
export * from './types.js';

export { actionMapper, type ActionCalls } from './action-mapper.js';

export {
  createAction,
  type ActionCreatorWithNonInferrablePayload,
  type ActionCreatorWithoutPayload,
  type ActionCreatorWithPayload,
  type ActionCreatorWithOptionalPayload,
  type ActionCreatorWithPreparedPayload,
  type PayloadActionCreator,
} from './create-action';

export { getBaseType } from './get-base-type';

export {
  createAsyncAction,
  isRequestAction,
  isCompleteAction,
  isFailureAction,
  isSuccessAction,
} from './create-async-action';
