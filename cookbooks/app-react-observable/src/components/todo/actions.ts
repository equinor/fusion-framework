import { createAction } from '@equinor/fusion-observable';

import type { ReorderTodoPayload } from './types';

/** Actions supported by the observable todo store. */
export const todoActions = {
  updateDraft: createAction<string>('todo/update-draft'),
  add: createAction('todo/add'),
  toggle: createAction<string>('todo/toggle'),
  remove: createAction<string>('todo/remove'),
  clearCompleted: createAction('todo/clear-completed'),
  reorder: createAction<ReorderTodoPayload>('todo/reorder'),
  reset: createAction('todo/reset'),
};
