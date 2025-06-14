# Observable

## `isObservableInput`

A utility to check if a value is an observable-like input (Observable, Promise, or Iterable). Useful for writing flexible APIs or utilities that can accept a wide range of input types.

**Example:**

```ts
import { isObservableInput } from '@equinor/fusion-observable';
import { of } from 'rxjs';

isObservableInput(Promise.resolve(1)); // true
isObservableInput([1, 2, 3]); // true
isObservableInput(of(42)); // true
isObservableInput({}); // false
```

## `toObservable`

```ts
import { toObservable } from '@equinor/fusion-observable';
A utility to convert various input types (value, function, promise, observable, iterable) into a consistent Observable stream. This allows you to handle inputs uniformly without worrying about their original type.
**Example:**

```ts
import { lastValueFrom, Observable } from 'rxjs';
import { toObservable, type DynamicInputValue } from '@equinor/fusion-observable';

const flexibleHandler = async (input: DynamicInputValue<{foo: string}>) => {
  return lastValueFrom(toObservable(input));
};

// All of these work the same way:
flexibleHandler(Promise.resolve({foo: 'bar'})).then(console.log); // {foo: 'bar'}
flexibleHandler({foo: 'baz'}).then(console.log); // {foo: 'baz'}
flexibleHandler(() => ({foo: 'qux'})).then(console.log); // {foo: 'qux'}
flexibleHandler(async () => ({foo: 'async'})).then(console.log); // {foo: 'async'}
flexibleHandler(new Observable((subscriber) => {
  subscriber.next({foo: 'bar'}); // skipped
  subscriber.next({foo: 'baz'});
  subscriber.complete();
})).then(console.log); // {foo: 'baz'}
```

*Works with iterables and async generators too:*
```ts
function* gen() {
  yield 1;
  yield 2;
}
toObservable(gen()).subscribe(console.log); // 1, 2

async function* asyncGen() {
  yield 'a';
  yield 'b';
}
toObservable(asyncGen()).subscribe(console.log); // 'a', 'b'
```


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
  const items = useObservableState(state$).next;
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
