# Observable


## React

### Observable

```tsx

type TodoItem = {
  id: string;
  txt: string;
}

type State = Record<string, TodoItem>;

enum ActionType {
  ADD = 'add',
  REMOVE = 'remove'
}

type ActionAdd = {
  type: ActionType.ADD,
  payload: Omit<TodoItem, 'id'>;
}

type ActionRemove = {
  type: ActionType.REMOVE
  payload: string;
}

type Actions = ActionAdd | ActionRemove

const reducer = (state: State, action: Actions) => {
  switch(action) {
    case ActionType.ADD:
      return {
        ...state,
        [generateId()]: action.payload
      };

    case ActionType.REMOVE:{
      const next = {...state};
      delete next[action.payload];
      return next;
    }
  }
};

const TodoContext = React.createContext();

export const TodoListProvider = (
  options: React.PropsWithChildren<{ initial: State }>
) => {

  const [selected, setSelected] = useState<string|undefined>();
  const state$ = useObservable(reducer, initial);

  const add = useCallback((item: Emit<TodoItem, 'id'>) => {
    state$.next({ type: ActionType.ADD, payload: item });
  }, [state$]);

  const remove = useCallback((id: string) => {
    state$.next({ type: ActionType.REMOVE, payload: item });
  }, [state$])
  
  return (
    <TodoContext.Provider value={ {state$, add, remove, selected, setSelected} }>
      { options.children }
    </TodoContext.Provider>
  );
}

const TodoDetail = () => {
  const { state$, selected } = useContext(TodoContext);
  const item = useObservableSelectorState(state$, selected)
  return item ? (
    <div>
      <span>ID: {item.id}</span>
      <span>TXT: {item.txt}</span>
    </div>
  ) : null;
}

const AddTodo = () => {
  const { add } = useContext(TodoContext);
  const txtRef = useRef(null);
  const onSubmit = useCallback(() => {
    add({ txt: txtRef.current.value })
  }, [add, txtRef]);
  return (
    <div>
      <input ref={ txtRef } />
      <button onClick={ onSubmit } />
    </div>
  );
};

const TodoList = () => {
  const { state$, setSelected } = useContext(TodoContext);
  const { next: items } = useObservableState(state$);
  return (
    <ul>
      { Object.entries(items).map(
        ([key,value]) => <li key={key} onClick={ () => setSelected(key) }>{value.txt}</li>
      )}
    </ul>
  )
}

const App = () => {
  return (
    <TodoListProvider initial={ {} }>
      <TodoDetail />
      <TodoList />
      <AddTodo />
    </TodoListProvider>
  )
}

```
