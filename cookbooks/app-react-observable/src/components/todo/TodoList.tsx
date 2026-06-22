import type { DragEvent, ReactElement } from 'react';

import { useTodoStore } from './TodoProvider';
import { useTodoState } from './hooks';
import { TodoListItem } from './TodoListItem';

/**
 * Renders the draggable todo list and dispatches reorder actions.
 *
 * @returns A draggable list of todo items.
 * @example
 * <TodoList />
 */
export const TodoList = (): ReactElement => {
  const store = useTodoStore();
  const state = useTodoState();

  const startDrag = (event: DragEvent<HTMLLIElement>, id: string): void => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const allowDrop = (event: DragEvent<HTMLLIElement>): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const dropTodo = (event: DragEvent<HTMLLIElement>, targetId: string): void => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    if (draggedId) {
      store.dispatch.reorder({ draggedId, targetId });
    }
  };

  const toggleTodo = (id: string): void => {
    store.dispatch.toggle(id);
  };

  const removeTodo = (id: string): void => {
    store.dispatch.remove(id);
  };

  return (
    <ul style={{ display: 'grid', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
      {state.items.map((item) => (
        <TodoListItem
          key={item.id}
          item={item}
          onDragStart={startDrag}
          onDragOver={allowDrop}
          onDrop={dropTodo}
          onToggle={toggleTodo}
          onRemove={removeTodo}
        />
      ))}
    </ul>
  );
};
