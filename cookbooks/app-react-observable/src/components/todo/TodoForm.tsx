import type { FormEvent, ReactElement } from 'react';

import { useTodoStore } from './TodoProvider';
import { useTodoState } from './hooks';
import { TodoButton } from './TodoButton';

/**
 * Renders the controlled todo draft input and add command.
 *
 * @returns A form that dispatches draft and add actions to the todo store.
 * @example
 * <TodoForm />
 */
export const TodoForm = (): ReactElement => {
  const store = useTodoStore();
  const state = useTodoState();

  const submitTodo = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    store.dispatch.add();
  };

  const updateDraft = (event: FormEvent<HTMLInputElement>): void => {
    store.dispatch.updateDraft(event.currentTarget.value);
  };

  return (
    <form onSubmit={submitTodo} style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        value={state.draft}
        onInput={updateDraft}
        placeholder="Add a task"
        style={{
          flex: 1,
          minWidth: 0,
          border: '1px solid #9aacb8',
          borderRadius: '0.35rem',
          padding: '0.5rem 0.75rem',
        }}
      />
      <TodoButton type="submit">Add</TodoButton>
    </form>
  );
};
