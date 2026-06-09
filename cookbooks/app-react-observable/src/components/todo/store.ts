import { createState, type FlowState } from '@equinor/fusion-observable';

import { todoActions } from './actions';
import { buildTodoReducer, createInitialTodoState } from './reducer';
import type { TodoState } from './types';

/** Observable todo store with generated dispatch functions for every todo action. */
export type TodoStore = FlowState<TodoState, typeof todoActions>;

/**
 * Creates the observable todo store used by the cookbook component.
 *
 * @returns A FlowSubject-backed todo store with typed actions and dispatch functions.
 */
export function createTodoStore(): TodoStore {
  return createState(todoActions, {
    initial: createInitialTodoState,
    builder: buildTodoReducer,
  });
}
