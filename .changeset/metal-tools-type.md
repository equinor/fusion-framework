---
'@equinor/fusion-query': patch
---

fixed issue where queries where executed before observed.

> __This fix might break existing code, if observation was wrongly implemented!__

```ts
const queryClient = new Query({
  client: {
    fn: async (value: string) => new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve(value);
        }, 50);
      }
    )
  },
  key: (value) => value,
});

/** execute observables sequential */
concat(
  /** after 100ms emits 'foo' */
  interval(100).map(() => 'foo'),
  /** after 50ms emits 'bar' */
  queryClient.query('bar')
).subscribe(console.log);

```
__expected result:__
```diff
+ 100ms 'foo' 50ms 'bar' |
```
__actual result:__
```diff
- 50ms 'bar' 50ms 'foo' |
```

this is now resolved by having an inner task which is not add request to the queue before the task is observed
 