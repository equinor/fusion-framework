---
'@equinor/fusion-observable': minor
---

Added a new `useObservableExternalStore` hook to subscribe to an observable source and provide its state to React components.

-   Introduced `useObservableExternalStore` hook.
-   The hook subscribes to an observable source and provides its state, including the latest value, any error, and completion status.
-   The hook requires the observable source to be memoized using `useMemo` to prevent unnecessary re-subscriptions.

To use the new `useObservableExternalStore` hook, import it and pass an observable source and an optional initial value:

```tsx
import { useObservableExternalStore } from '@your-package-name';
import { useMemo } from 'react';
import { of } from 'rxjs';

const MyComponent = () => {
    const myObservable = useMemo(() => of('Hello, universe!'), []);
    const { value, error, complete } = useObservableExternalStore(myObservable, 'Hello, world!');

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!complete) {
        return <div>Await data</div>;
    }

    return <div>Value: {value}</div>;
};
```
