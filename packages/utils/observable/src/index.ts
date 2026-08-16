/**
 * [[include:observable/README.MD]]
 * @module
 */

export { castDraft, enableMapSet } from 'immer';

export * from './FlowSubject.js';
export * from './actions/ActionError.js';
export * from './types/index.js';

/** @deprecated use {@link FlowSubject} */
export { FlowSubject as ReactiveObservable } from './FlowSubject.js';

export { actionMapper, type ActionCalls } from './actions/action-mapper.js';

export { createAction, type ActionCreatorWithPreparedPayload } from './actions/create-action.js';
export { getBaseType } from './actions/utils.js';

export {
  createAsyncAction,
  isRequestAction,
  isCompleteAction,
  isFailureAction,
  isSuccessAction,
} from './actions/create-async-action.js';

export { createReducer, ActionReducerMapBuilder } from './create-reducer.js';

export { createState, type FlowState } from './create-state.js';

export { isObservableInput } from './is-observable-input.js';

export { toObservable, type DynamicInputValue } from './to-observable.js';
