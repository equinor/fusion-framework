---
'@equinor/fusion-framework-module-event': minor
---

Added feature for allowing the event listener to mutate the event details.

**NOTE:** to not break the current behavior, the event creator needs to set the `allowMutate` flag to `true` in the event details.

```ts
/** example of event listener */
eventModule.on('foo', (event) => {
    event.updateDetails((details) => {
        details.foo = 'bar';
    });
});

/** example of event creation */
const event = new CustomEvent({ foo: 'foo' }, { allowMutate: true });
await eventModule.emit(event);

console.log(event.details.foo); // bar
console.log(event.originalDetails.foo); // foo
```

The package now uses `immer` to allow for immutability of the event details. This means that the event details can be mutated in the event listener without affecting the original event details.
