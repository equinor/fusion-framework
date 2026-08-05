export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TodoList = {
  items: TodoItem[];
  lastModified: string;
};
