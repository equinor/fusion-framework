import type { ActionReducerMapBuilder } from '@equinor/fusion-observable';

import type { todoActions } from './actions';
import type { ReorderTodoPayload, TodoItem, TodoState } from './types';

/**
 * Creates the initial todo state used by the reducer and reset action.
 *
 * @returns A fresh todo store state.
 */
export function createInitialTodoState(): TodoState {
  return {
    draft: '',
    nextId: 4,
    items: [
      { id: 'todo-1', title: 'Create observable actions', completed: true },
      { id: 'todo-2', title: 'Handle reducer cases', completed: false },
      { id: 'todo-3', title: 'Drag tasks into priority order', completed: false },
    ],
  };
}

/**
 * Reorders todo items by moving one item before another item.
 *
 * @param items - Current todo item order.
 * @param payload - Dragged and target item identifiers.
 * @returns A reordered item array, or the original order when the payload is invalid.
 */
export function reorderTodoItems(
  items: Array<TodoItem>,
  payload: ReorderTodoPayload,
): Array<TodoItem> {
  const fromIndex = items.findIndex((item) => item.id === payload.draggedId);
  const toIndex = items.findIndex((item) => item.id === payload.targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return items;
  }

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(fromIndex, 1);
  if (!draggedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, draggedItem);
  return nextItems;
}

/**
 * Registers reducer cases for the observable todo store.
 *
 * @param builder - Reducer builder receiving todo action handlers.
 * @param actions - Todo action creators used to bind reducer cases.
 */
export function buildTodoReducer(
  builder: ActionReducerMapBuilder<TodoState>,
  actions: typeof todoActions,
): void {
  builder
    .addCase(actions.updateDraft, (state, action) => {
      state.draft = action.payload;
    })
    .addCase(actions.add, (state) => {
      const title = state.draft.trim();
      if (!title) {
        return;
      }

      state.items.push({
        id: `todo-${state.nextId}`,
        title,
        completed: false,
      });
      state.nextId += 1;
      state.draft = '';
    })
    .addCase(actions.toggle, (state, action) => {
      const item = state.items.find((candidate) => candidate.id === action.payload);
      if (item) {
        item.completed = !item.completed;
      }
    })
    .addCase(actions.remove, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    })
    .addCase(actions.clearCompleted, (state) => {
      state.items = state.items.filter((item) => !item.completed);
    })
    .addCase(actions.reorder, (state, action) => {
      state.items = reorderTodoItems(state.items, action.payload);
    })
    .addCase(actions.reset, () => createInitialTodoState());
}
