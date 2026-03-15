# @equinor/fusion-observable

Reactive state management utilities built on RxJS and Immer for Fusion Framework applications. Provides an action-driven, observable state container (`FlowSubject`), action creators, reducer builders, RxJS operators, and React hooks for subscribing to observable state.

## Features

- **FlowSubject** — an observable state container that processes actions through a reducer, similar to Redux but fully reactive with RxJS.
- **createReducer** — builds immutable reducers with Immer-powered draft mutations and a builder-pattern API (`addCase`, `addMatcher`, `addDefaultCase`).
- **createAction / createAsyncAction** — type-safe action creator factories with optional payload preparation, including async request/success/failure patterns.
- **createState** — convenience factory that wires a `FlowSubject`, action definitions, and dispatch functions in one call.
- **RxJS operators** — `filterAction`, `mapAction`, `switchMapAction`, `mapProp` for concise action-stream transformations.
- **React hooks** — `useObservable`, `useObservableState`, `useObservableSelector`, `useObservableEffect`, `useObservableFlow`, `useDebounce`, and more.
- **Utility functions** — `isObservableInput` and `toObservable` for normalising diverse input types into RxJS observables.

## Installation

```sh
pnpm add @equinor/fusion-observable
```

## Usage

### Creating a state container

```ts
import { createAction, createReducer, FlowSubject } from '@equinor/fusion-observable';

// Define actions
const increment = createAction<number>('increment');
const decrement = createAction<number>('decrement');

// Build a reducer with Immer support
const reducer = createReducer({ count: 0 }, (builder) =>
  builder
    .addCase(increment, (state, action) => { state.count += action.payload; })
    .addCase(decrement, (state, action) => { state.count -= action.payload; }),
);

// Create the observable state container
const counter = new FlowSubject(reducer);
counter.subscribe((state) => console.log('Count:', state.count));
counter.next(increment(1)); // Count: 1
counter.next(increment(5)); // Count: 6
```

### Using `createState` for quick setup

```ts
import { createState, createAction } from '@equinor/fusion-observable';

const actions = {
  setName: createAction<string>('setName'),
};

const { subject, dispatch } = createState(actions, {
  initial: { name: '' },
  builder: (builder, actions) => {
    builder.addCase(actions.setName, (state, action) => {
      state.name = action.payload;
    });
  },
});

dispatch.setName('Alice');
console.log(subject.value); // { name: 'Alice' }
```

### Async actions

```ts
import { createAsyncAction, isSuccessAction, isFailureAction } from '@equinor/fusion-observable';

const fetchUser = createAsyncAction(
  'fetchUser',
  (id: string) => ({ payload: { id } }),
  (user: User) => ({ payload: user }),
  (error: Error) => ({ payload: error }),
);

// fetchUser('123')           → { type: 'fetchUser::request', payload: { id: '123' } }
// fetchUser.success(user)    → { type: 'fetchUser::success', payload: user }
// fetchUser.failure(error)   → { type: 'fetchUser::failure', payload: error }
```

### Normalising inputs with `toObservable`

```ts
import { toObservable } from '@equinor/fusion-observable';

// Works with values, promises, functions, iterables, and observables
toObservable(42).subscribe(console.log);                        // 42
toObservable(Promise.resolve('hello')).subscribe(console.log);  // 'hello'
toObservable(() => 'computed').subscribe(console.log);           // 'computed'
```

### React hooks

```tsx
import { useObservable, useObservableState } from '@equinor/fusion-observable/react';

function Counter() {
  const subject = useObservable(reducer, { count: 0 });
  const { value } = useObservableState(subject);

  return (
    <div>
      <p>Count: {value.count}</p>
      <button onClick={() => subject.next(increment(1))}>+1</button>
    </div>
  );
}
```

### RxJS operators

```ts
import { filterAction, mapAction, switchMapAction } from '@equinor/fusion-observable/operators';

// Filter to specific actions
action$.pipe(filterAction('increment')).subscribe(handleIncrement);

// Filter + map in one step
action$.pipe(mapAction('fetchSuccess', (a) => a.payload.data)).subscribe(setData);

// Filter + switchMap for async flows
action$.pipe(switchMapAction('search', (a) => fetchResults(a.payload))).subscribe(setResults);
```

## API Reference

### Core (`@equinor/fusion-observable`)

| Export | Description |
|---|---|
| `FlowSubject<S, A>` | Observable state container driven by actions and a reducer |
| `createReducer(initial, builder)` | Builds an Immer-powered reducer with builder pattern |
| `createAction<P>(type)` | Creates a type-safe action creator |
| `createAsyncAction(type, request, success, failure?)` | Creates request/success/failure action creators |
| `createState(actions, reducer)` | Wires `FlowSubject` + actions + dispatch in one call |
| `actionMapper(actions, subject)` | Binds action creators to a subject as dispatch functions |
| `ActionError` | Error class linking an action to a causal error |
| `ActionReducerMapBuilder` | Builder interface for defining case reducers |
| `isObservableInput(input)` | Type guard for RxJS `ObservableInput` values |
| `toObservable(input, ...args)` | Converts values/functions/promises to `Observable` |

### Operators (`@equinor/fusion-observable/operators`)

| Export | Description |
|---|---|
| `filterAction(...types)` | Filters an action stream by type(s) |
| `mapAction(type, fn)` | Filters by type and maps the result |
| `switchMapAction(type, fn)` | Filters by type and switchMaps to an inner observable |
| `mapProp(path)` | Extracts a nested property via a dot-path string |

### React hooks (`@equinor/fusion-observable/react`)

| Export | Description |
|---|---|
| `useObservable(reducer, initial?)` | Creates a memoised `FlowSubject` |
| `useObservableState(subject, options?)` | Tracks value/error/complete of an observable |
| `useObservableSelector(subject, selector)` | Derives a child observable with `distinctUntilChanged` |
| `useObservableEffect(subject, effect)` | Attaches a side-effect to a `FlowSubject` |
| `useObservableFlow(subject, flow)` | Attaches an epic-style flow to a `FlowSubject` |
| `useObservableSubscription(obs, observer)` | Manages an observable subscription lifecycle |
| `useObservableRef(subject)` | Keeps a ref synchronised with observable emissions |
| `useObservableInput(input)` | Converts `ObservableInput` to `Observable` |
| `useObservableInputState(input)` | Combines `useObservableInput` + `useObservableState` |
| `useDebounce(fn, options)` | Debounces a function and exposes results as an observable |

### Actions (`@equinor/fusion-observable/actions`)

Re-exports action types, `ActionError`, and action creator utilities for consumers that only need the action layer.
