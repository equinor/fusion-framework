---
'@equinor/fusion-observable': minor
---

Use initial state from observable if observable has value property

- update typing og arguments
- update initial state to fallback to `observable.value`
  - _`opt.initial` will supersede `observable.value`_
  -  internally `useLayoutEffect` subscribes to subject, so `opt.initial` will be overridden in next `tick`
- when provided subject changes instance, subscription will set current state to `observable.value` of the new subject
  - only applies if new observable has value property


update typing when using stateful observable in `useObservableState`

if the source has a value property, the state will return the type of the observable

_previously the return type was observable type or `undefined`, since the initial state would be undefined before source emits values_

```ts
/** value: {foo:string}|undefined  */
const { value } = useObservableState(source$ as Observable<{foo:string}>);
/** value: {foo:string}  */
const { value } = useObservableState(source$ as BehaviorSubject<{foo:string}>);

/* override initial value  */
const { value } = useObservableState(source$ as BehaviorSubject<{foo:string}>, {initial: 'bar'});
```