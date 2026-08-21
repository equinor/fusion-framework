/**
 * [[include:observable/README.MD]]
 * @module
 */

export { castDraft, enableMapSet } from 'immer';

export * from './FlowSubject';
export * from './actions/ActionError';
export * from './types';

/** @deprecated use {@link FlowSubject} */
export { FlowSubject as ReactiveObservable } from './FlowSubject';

export { actionMapper, type ActionCalls } from './actions/action-mapper';

export { createAction, type ActionCreatorWithPreparedPayload } from './actions/create-action';
export { getBaseType } from './actions/utils';

export {
  createAsyncAction,
  isRequestAction,
  isCompleteAction,
  isFailureAction,
  isSuccessAction,
} from './actions/create-async-action';

export { createReducer, ActionReducerMapBuilder } from './create-reducer';

export { createState, type FlowState } from './create-state';

export { isObservableInput } from './is-observable-input';

export { toObservable, type DynamicInputValue } from './to-observable';
