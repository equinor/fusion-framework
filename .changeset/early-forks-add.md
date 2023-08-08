---
'@equinor/fusion-observable': minor
---

Add operator for using string property selector on `Observable<Record<string, unknown>>`

example:
```ts
// Observable<{foo: {bar: string}}>
observable.pipe(mapProp('foo')) // Observable<{bar:string}>
observable.pipe(mapProp('foo.bar')) // Observable<string>
``````
