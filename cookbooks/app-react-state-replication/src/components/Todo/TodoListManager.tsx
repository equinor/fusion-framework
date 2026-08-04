import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { TodoItem, TodoList } from './types';
import { TodoForm } from './TodoForm';
import { TodoList as TodoListComponent } from './TodoList';
import { TodoStats } from './TodoStats';
import { LastModified } from './LastModified';
import { useCallback } from 'react';

import { v4 as uuid } from 'uuid';

/**
 * Manages replicated task state with real-world data.
 *
 * This component shows how complex application state (a task list)
 * can be synchronized between the local app and remote CouchDB.
 * Changes made here will be replicated to other instances of the app.
 *
 * Features:
 * - Add/remove/toggle task items
 * - Persistent state across sessions
 * - Real-time sync with other app instances
 * - Optimistic updates with automatic conflict resolution
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

      setTodoList((prev) => {
        const items = [...(prev?.items || []), newTodo];
        console.log('Adding todo:', newTodo);
        console.log('Previous todo list:', prev);
        console.log('Updated todo list:', items);
        return {
          items,
          foo: 'bar',
          lastModified: new Date().toISOString(),
        };
      });
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
      <h2>📝 Replicated Todo List</h2>
      <p>
        Add todos below. Changes are automatically synced with CouchDB and will appear in other
        instances of this app in real-time.
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
