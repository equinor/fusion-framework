/** Todo item tracked by the observable todo store. */
export interface TodoItem {
  /** Stable identifier used for rendering, updates, and drag/drop payloads. */
  id: string;
  /** User-facing todo title. */
  title: string;
  /** Whether the todo has been completed. */
  completed: boolean;
}

/** State snapshot managed by the observable todo store reducer. */
export interface TodoState {
  /** Current controlled input value for the add-todo form. */
  draft: string;
  /** Next numeric suffix used when creating a todo id. */
  nextId: number;
  /** Ordered todo items rendered by the list. */
  items: Array<TodoItem>;
}

/** Payload used to move a dragged todo before a target todo. */
export interface ReorderTodoPayload {
  /** Identifier of the todo being dragged. */
  draggedId: string;
  /** Identifier of the todo that receives the drop. */
  targetId: string;
}
