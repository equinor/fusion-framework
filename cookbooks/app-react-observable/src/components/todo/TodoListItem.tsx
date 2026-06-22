import type { DragEvent, ReactElement } from 'react';

import { buttonStyle } from '../styles';
import type { TodoItem } from './types';

interface TodoListItemProps {
  /** Todo item rendered by the row. */
  item: TodoItem;
  /** Handler that stores the dragged todo id. */
  onDragStart: (event: DragEvent<HTMLLIElement>, id: string) => void;
  /** Handler that allows move drops on the row. */
  onDragOver: (event: DragEvent<HTMLLIElement>) => void;
  /** Handler that reorders the dragged todo before this row. */
  onDrop: (event: DragEvent<HTMLLIElement>, targetId: string) => void;
  /** Handler that toggles the completed state. */
  onToggle: (id: string) => void;
  /** Handler that removes the todo item. */
  onRemove: (id: string) => void;
}

/**
 * Renders a draggable todo row for the observable todo store.
 *
 * @param item - Todo item rendered by the row.
 * @param onDragStart - Handler that stores the dragged todo id.
 * @param onDragOver - Handler that allows move drops on the row.
 * @param onDrop - Handler that reorders the dragged todo before this row.
 * @param onToggle - Handler that toggles the completed state.
 * @param onRemove - Handler that removes the todo item.
 * @returns A draggable todo list item.
 * @example
 * <TodoListItem item={item} onToggle={toggle} onRemove={remove} onDragStart={startDrag} onDragOver={allowDrop} onDrop={dropTodo} />
 */
export const TodoListItem = ({
  item,
  onDragStart,
  onDragOver,
  onDrop,
  onToggle,
  onRemove,
}: TodoListItemProps): ReactElement => {
  return (
    <li
      draggable
      onDragStart={(event) => onDragStart(event, item.id)}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, item.id)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        border: '1px solid #d6dde2',
        borderRadius: '0.35rem',
        background: item.completed ? '#eef4f1' : '#ffffff',
        cursor: 'grab',
      }}
    >
      <input type="checkbox" checked={item.completed} onChange={() => onToggle(item.id)} />
      <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</span>
      <button type="button" style={buttonStyle} onClick={() => onRemove(item.id)}>
        Remove
      </button>
    </li>
  );
};
