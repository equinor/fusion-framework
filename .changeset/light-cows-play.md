---
'@equinor/fusion-framework-react-module-event': minor
---

Add hook for observing event streams

```ts
/* observe stream of events */
const someEvent$ = useEventStream(
  'some_event',
  useCallback(
    (event$) => event$.pipe(
      // only some events
      filter(e => e.detail.foo === dep.foo),
      // mutate data
      map(e => e.detail)
    )
  ), [dep]
);
/* use state of stream */
const someEvent = useObservableState(someEvent$);
```