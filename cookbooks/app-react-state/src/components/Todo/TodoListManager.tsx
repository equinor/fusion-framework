import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { TodoItem, TodoList } from './types';
import { TodoForm } from './TodoForm';
import { TodoList as TodoListComponent } from './TodoList';
import { TodoStats } from './TodoStats';
import { LastModified } from './LastModified';
import { useCallback } from 'react';

import { v4 as uuid } from 'uuid';

/**
 * Demonstrates `useAppState` with an *array* inside an object - the most realistic shape for
 * real app data, where a list needs to be added to, updated in place, and filtered.
 *
 * Persisted the same way as the simpler examples in `Basics.tsx`: to local storage by default,
 * or to CouchDB - and therefore to every other open tab/device - when replication is configured
 * (see `src/config.ts`).
 */
export const TodoListManager = () => {
  const [todoList, setTodoList] = useAppState<TodoList>('todos', {
    defaultValue: {
      items: [],
      lastModified: new Date().toISOString(),
    },
  });

  const addTodo = useCallback(
    (title: string) => {
      // Ignore empty submissions so the replicated list never stores blank items.
      if (!title.trim()) return;

      const newTodo: TodoItem = {
        id: uuid(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTodoList((prev) => ({
        items: [...(prev?.items ?? []), newTodo],
        lastModified: new Date().toISOString(),
      }));
    },
    [setTodoList],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setTodoList((prev) => {
        // A missing state value means there is nothing to toggle.
        if (!prev) return prev;

        return {
          ...prev,
          items: prev.items
            // Update only the selected item while preserving the list order.
            .map((item) =>
              item.id === id
                ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
                : item,
            ),
          lastModified: new Date().toISOString(),
        };
      });
    },
    [setTodoList],
  );

  const removeTodo = useCallback(
    (id: string) => {
      setTodoList((prev) => {
        // A missing state value means there is nothing to remove.
        if (!prev) return prev;

        return {
          ...prev,
          items: prev.items
            // Remove the selected item from the replicated list.
            .filter((item) => item.id !== id),
          lastModified: new Date().toISOString(),
        };
      });
    },
    [setTodoList],
  );

  const clearCompleted = useCallback(() => {
    setTodoList((prev) => {
      // A missing state value means there are no completed items to clear.
      if (!prev) return prev;

      return {
        ...prev,
        items: prev.items
          // Keep active items and discard only completed items.
          .filter((item) => !item.completed),
        lastModified: new Date().toISOString(),
      };
    });
  }, [setTodoList]);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2>📝 Todo List</h2>
      <p>
        Add todos below - they persist across page reloads, and sync to every other open tab or
        device once CouchDB replication is configured (see <code>src/config.ts</code>).
      </p>

      <TodoForm onAdd={addTodo} />
      <TodoStats items={todoList?.items || []} onClearCompleted={clearCompleted} />
      <TodoListComponent
        items={todoList?.items || []}
        onToggle={toggleTodo}
        onRemove={removeTodo}
      />
      <LastModified lastModified={todoList?.lastModified} />
    </div>
  );
};
