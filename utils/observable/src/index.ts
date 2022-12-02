/**
 * [[include:observable/README.MD]]
 * @module
 */

export * from './FlowSubject';
export * from './ActionError';
export * from './types';

/** @deprecated use {@link FlowSubject} */
export { FlowSubject as ReactiveObservable } from './FlowSubject';

export { createAction, createAsyncAction } from './create-action';
export { createReducer } from './create-reducer';
