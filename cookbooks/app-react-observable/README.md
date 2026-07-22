# Observable React Cookbook

This cookbook teaches how to use `useObservableState`, `useObservableSelector`, `createAction`,
and `createState` from `@equinor/fusion-observable` in a Fusion React app.

Use it in two modes:

- **Learn the path**: run the app and move through the examples from top to bottom.
- **Find the pattern**: jump to the resource map when you already know the problem you are solving.

## Run It First

Start the cookbook and keep the source open beside the running app.

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-observable dev
```

Build the cookbook with:

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-observable build
```

## Learning Journey

Follow the journey one stop at a time. Each stop has one idea, one small code shape, and one
place in the cookbook to inspect.

### 1. Render A Value From A Stateful Observable

Start here when an RxJS source already has a current value. `BehaviorSubject` gives the hook a
value on the first render.

```tsx
const counter = useMemo(() => new BehaviorSubject(0), []);
const counterState = useObservableState(counter);

counter.next(counter.value + 1);
```

What makes it tick: the subject instance is stable, `useObservableState` subscribes once, and
each `next` emission updates `counterState.value`.

Open `src/components/observable/StatefulSubjectPanel.tsx`.

### 2. Give A Plain Subject A First Render

Use this when the observable has no current value. `initial` gives React something deliberate to
render before the first emission.

```tsx
const messageState = useObservableState(subject, {
  initial: 'No message emitted yet',
});

subject.next('Message received');
```

What makes it tick: `initial` is only the starting value. Future `subject.next` calls replace it
with real stream data.

Open `src/components/observable/PlainSubjectPanel.tsx`.

### 3. Treat Errors And Completion As UI State

Use this when the UI needs to show whether a stream is active, completed, or failed.

```tsx
const state = useObservableState<number, string, number>(subject, { initial: 0 });
const hasError = state.error !== null;

subject.error('Simulated observable failure');
```

What makes it tick: `useObservableState` keeps the last `value` and exposes terminal state through
`error` and `complete`. Retrying means creating a fresh subject because errored and completed
subjects are terminal.

Open `src/components/observable/ErrorStatePanel.tsx`.

### 4. Control When A Stream Resubscribes

Use this when the observable is created from selected render inputs, such as a selected feed name.

```tsx
const liveFeedState = useObservableState(
  interval(1000).pipe(map((tick) => `${feedName} tick ${tick}`)),
  {
    initial: `${feedName} feed is starting`,
    deps: [feedName],
    teardown: () => setTeardownCount((count) => count + 1),
  },
);
```

What makes it tick: `deps` names the values that should create a new subscription. `teardown`
confirms the old subscription was cleaned up.

Open `src/components/observable/DepsAndTeardownPanel.tsx`.

### 5. Move From Hook State To A Shared Store

Use this when several components need to read and update the same local state model.

```ts
export const todoActions = {
  add: createAction('todo/add'),
  toggle: createAction<string>('todo/toggle'),
};

export function createTodoStore(): TodoStore {
  return createState(todoActions, {
    initial: createInitialTodoState,
    builder: buildTodoReducer,
  });
}
```

What makes it tick: `createAction` defines named commands, `createState` creates a `FlowSubject`,
and the generated `dispatch` map gives components typed write operations.

Open these files in order:

- `src/components/todo/actions.ts`
- `src/components/todo/reducer.ts`
- `src/components/todo/store.ts`
- `src/components/todo/TodoProvider.tsx`

### 6. Read Small, Dispatch Intent

Use selectors when a component only needs one derived value from the store. Dispatch actions from
UI handlers so state transitions stay in the reducer.

```ts
const selected$ = useObservableSelector(store.subject, selector);

return useObservableState(selected$, {
  initial: selector(store.subject.value),
}).value;
```

```tsx
<TodoButton onClick={() => store.dispatch.clearCompleted()}>
  Clear completed
</TodoButton>
```

What makes it tick: selectors keep subscriptions focused, while dispatch functions keep writes
named as user intent: `add`, `toggle`, `remove`, `reorder`, `clearCompleted`, and `reset`.

Open these files in order:

- `src/components/todo/hooks.ts`
- `src/components/todo/TodoStats.tsx`
- `src/components/todo/TodoForm.tsx`
- `src/components/todo/TodoList.tsx`

## Use It As A Resource

When you come back later, start with the problem you have and jump straight to the matching file.

| I need to... | Start here | Look for |
| --- | --- | --- |
| Render a current observable value | `src/components/observable/StatefulSubjectPanel.tsx` | `BehaviorSubject`, `useObservableState` |
| Render before the first emission | `src/components/observable/PlainSubjectPanel.tsx` | `initial`, reset by new subject |
| Show stream failure or completion | `src/components/observable/ErrorStatePanel.tsx` | `error`, `complete`, retry with fresh subject |
| Prevent accidental resubscribe | `src/components/observable/DepsAndTeardownPanel.tsx` | `deps`, `teardown` |
| Create typed local commands | `src/components/todo/actions.ts` | `createAction` |
| Put state transitions in one place | `src/components/todo/reducer.ts` | `buildTodoReducer`, reducer cases |
| Create an observable store | `src/components/todo/store.ts` | `createState`, `FlowSubject`, `dispatch` |
| Share the store through React | `src/components/todo/TodoProvider.tsx` | `TodoProvider`, `useTodoStore` |
| Subscribe to derived values | `src/components/todo/hooks.ts` | `useObservableSelector`, `useTodoSelector` |
| Dispatch from UI controls | `src/components/todo/TodoForm.tsx`, `src/components/todo/TodoList.tsx` | `store.dispatch.*` |

## Mental Model

Small observable examples answer: **How does React render a stream?**

The todo example answers: **How does a feature share observable state across components?**

The progression is intentional:

1. Subscribe to one observable.
2. Handle missing, completed, and failed values.
3. Control subscription lifetime.
4. Promote repeated state changes into typed actions.
5. Read with selectors and write with dispatch.
