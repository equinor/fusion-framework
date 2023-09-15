---
'@equinor/fusion-query': major
---

Change abort behavior of QueryClient

this also fixes the issue where only the first requester of a request could provide abort controller.

_success_:
```ts
const controllerA = new AbortController();
const controllerB = new AbortController();
const tasks = Promise.All([
  foo.query('bar', {controller: controllerA}), 
  foo.query('bar', {controller: controllerB})
]);
try {
  setTimeout(() => controllerA.abort(), 10);
  await tasks;
} catch (err) {
  // success
}
```
```diff
- setTimeout(() => controllerA.abort(), 10);
+ setTimeout(() => controllerB.abort(), 10);
```

query wil no longer abort since task is attached to `controllerA`

> the query client will return the ongoing task _(if not completed)_ for matching query key.
```ts
let calls = 0;
const query = new Query({
    client: {
        queueOperator: 'merge',
        fn: (value) => {
          return new Promise(resolve => setTimeout(() => {
            call++
            resolve(value);
          }, 100))
          value
        },
    },
    key: (value) => value,
});
setTimeout(
  // calls = 1
  () => query.queryAsync('foo').then(() => console.log(calls)), 
  0
);
setTimeout(
  // calls = 1, since sharing first request
  () => query.queryAsync('foo').then(() => console.log(calls)), 
  50
);
setTimeout(
  // calls = 2
  () => query.queryAsync('bar').then(() => console.log(calls)), 
  100
);
setTimeout(
  // calls = 3
  () => query.queryAsync('foo').then(() => console.log(calls)), 
  150
);
```

- expose current state of cache `QueryCache`
- update request handler to support signal
- update request processor to handle signal
- remove `AbortController` from action meta
- add functionality for aborting request by reference


__BREAKING_CHANGES:__

```diff 
 export type QueryClientOptions<TType = any, TArgs = any> = {
-    controller: AbortControl
+    signal?: AbortSignal;
     retry: Partial<RetryOptions>;
     /** reference to a query  */
     ref?: string;
     task?: Subject<QueryTaskValue<TType, TArgs>>;
};
```
migration
```diff
const foo = new Query(...);
const controller = new AbortController();
foo.query(
  args, 
- {controller}
+ {signal: controller.signal}
);