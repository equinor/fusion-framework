---
'@equinor/fusion-observable': minor
---

Added new constructor overloads and a `select` method to `FlowSubject` for enhanced state management and selection capabilities.

The `FlowSubject` class now supports constructor overloading, allowing for more flexible initialization with either a `ReducerWithInitialState<S, A>` or a `Reducer<S, A>` along with an `initialState`. This change enables users to set up the initial state of their `FlowSubject` instances in a way that best suits their application's needs.

Additionally, a new `select` method has been introduced. This method allows users to select and emit derived states from the `FlowSubject`'s state based on custom logic. The `select` method takes a `selector` function for computing the derived state and an optional `comparator` function for custom comparison logic, making state management more versatile and efficient.

The `selector` exposes an shorthand method for selecting derived states from the `FlowSubject`'s state without the need to import and use `map` and `distinctUntilChanged` operators from `RxJS`.

Consumers should update their code to utilize the new constructor overloads for initializing `FlowSubject` instances as needed. For advanced state management scenarios, consider using the `select` method to work with derived states efficiently. These changes are backward compatible and aim to provide more flexibility and functionality to the `FlowSubject` class.

```typescript
/** Example of using the new constructor with a reducer with initial state */
const reducerWithInitial = createReducer(
    { count: 0 }, // initial state
    (builder) => {
        builder.addCase('increment', (state) => {
            state.count += 1;
        });
        builder.addCase('decrement', (state) => {
            state.count -= 1;
        });
    },
);
const subject = new FlowSubject(reducerWithInitial);
```

```typescript
/** Example of using the new constructor with a plain reducer and initial state */
const reducer = (state, action) => {
  switch(action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return return { ...state, count: state.count - 1 };
  }
}
const flowSubject = new FlowSubject(reducer, { count: 0 });
```

```typescript
/** Example of using the new select method */
flowSubject
    .select(
        /** selector function */
        (state) => state.count,
        /** comparator function, optional, will use equal by default */
        (prev, next) => prev === next,
    )
    .subscribe(
        /** subscriber function */
        (count) => console.log(count),
    );

flowSubject.next({ type: 'increment' }); // logs 1
flowSubject.next({ type: 'increment' }); // logs 2
flowSubject.next({ type: 'decrement' }); // logs 1
```
