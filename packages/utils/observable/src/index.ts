/**
 * [[include:observable/README.MD]]
 * @module
 */

export { castDraft } from 'immer';

export * from './FlowSubject';
export * from './ActionError';
export * from './types';

/** @deprecated use {@link FlowSubject} */
export { FlowSubject as ReactiveObservable } from './FlowSubject';

export { actionMapper, type ActionCalls } from './action-mapper';

export {
    createAction,
    actionBaseType,
    type ActionCreatorWithPreparedPayload,
} from './create-action';

export {
    createAsyncAction,
    isRequestAction,
    isCompleteAction,
    isFailureAction,
    isSuccessAction,
} from './create-async-action';

export { createReducer, ActionReducerMapBuilder } from './create-reducer';

export { createState, type FlowState } from './create-state';
