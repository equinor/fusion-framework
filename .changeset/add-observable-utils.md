---
"@equinor/fusion-observable": minor
---

Add `isObservableInput` and `toObservable` utilities to make it easier to work with dynamic or flexible values—such as configuration, runtime data, or any input that might be a value, function, promise, or stream.

These utilities let you accept and process values in many forms—plain values, functions, promises, or streams (observables)—and always handle them in a consistent, observable-based way. This is especially helpful when you want to let users or other code supply input as a direct value, a callback (sync or async), or even a stream, and you want to process the result the same way regardless of the input type. While this is most commonly useful for runtime configuration, feature toggles, or similar scenarios, it can be applied to any case where input flexibility is needed.

**Why use this?**
- Accept config, data, or handlers in any form: value, function, promise, or observable.
- Write code that is agnostic to how the input is provided—no need for manual type checks or branching logic.
- Great for plugin systems, runtime config, feature toggles, or APIs that want to be flexible and future-proof.

**Example usage:**
```ts
import { isObservableInput, toObservable } from '@fusion-framework/utils-observable';

isObservableInput(Promise.resolve(1)); // true

// Always get an Observable, no matter the input type
const obs$ = toObservable(() => 42);
```

See the package README for more details and advanced usage.
