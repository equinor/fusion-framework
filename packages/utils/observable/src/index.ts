/**
 * [[include:observable/README.MD]]
 * @module
 */

export * from './FlowSubject';
export * from './ActionError';
export * from './types';

/** @deprecated use {@link FlowSubject} */
export { FlowSubject as ReactiveObservable } from './FlowSubject';

export { actionMapper, ActionCalls } from './action-mapper';

export { createAction, actionBaseType, ActionCreatorWithPreparedPayload } from './create-action';

export {
    createAsyncAction,
    isRequestAction,
    isCompleteAction,
    isFailureAction,
    isSuccessAction,
} from './create-async-action';

export { createReducer, ActionReducerMapBuilder } from './create-reducer';

export { createState } from './create-state';
