# @equinor/fusion-framework-react-module-context

React hooks for the Fusion context module. Provides hooks to read the current context, set context, and query available contexts from React components.

**Import:**

```ts
import { useCurrentContext, useQueryContext, enableContext } from '@equinor/fusion-framework-react-module-context';
```

## Exports

| Export                      | Type     | Description                                                    |
| --------------------------- | -------- | -------------------------------------------------------------- |
| `useCurrentContext`         | Hook     | Read and set the current context (requires a provider argument) |
| `useModuleCurrentContext`   | Hook     | Read and set the current context from the closest module scope |
| `useQueryContext`           | Hook     | Search available contexts with debounce (requires a provider)  |
| `useModuleQueryContext`     | Hook     | Search available contexts from the closest module scope        |
| `enableContext`             | Function | Enable the context module in a configurator                    |
| `ContextModule`             | Type     | Context module type definition                                 |
| `ContextItem`               | Type     | A single context entry (project, facility, etc.)               |
| `IContextProvider`          | Type     | Context provider interface                                     |

## This Package vs `react-app/context`

| Scenario                                | Import from                                          |
| --------------------------------------- | ---------------------------------------------------- |
| Building a Fusion app (most common)     | `@equinor/fusion-framework-react-app/context`        |
| Building a reusable library or module   | `@equinor/fusion-framework-react-module-context`     |
| Building a portal or host application   | `@equinor/fusion-framework-react-module-context`     |

The `react-app/context` sub-path wraps these hooks with app-scoped convenience. Use this package directly when building framework-level code or shared libraries that need explicit provider injection.

## useCurrentContext / useModuleCurrentContext

Returns the currently selected context and a setter function.

```tsx
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';

const ContextInfo = () => {
  const { currentContext, setCurrentContext } = useModuleCurrentContext();

  if (!currentContext) return <p>No context selected</p>;

  return (
    <div>
      <p>{currentContext.title}</p>
      <button onClick={() => setCurrentContext(null)}>Clear</button>
    </div>
  );
};
```

## useQueryContext / useModuleQueryContext

Search for available contexts with built-in debounce (default 500ms).

```tsx
import { useModuleQueryContext } from '@equinor/fusion-framework-react-module-context';

const ContextSearch = () => {
  const { value: results, querying, query } = useModuleQueryContext();

  return (
    <div>
      <input onChange={(e) => query(e.target.value)} placeholder="Search contexts…" />
      {querying && <span>Searching…</span>}
      <ul>{results?.map((ctx) => <li key={ctx.id}>{ctx.title}</li>)}</ul>
    </div>
  );
};
```

## Related

- [`@equinor/fusion-framework-module-context`](../../modules/context/README.md) — the underlying context module
- [`@equinor/fusion-framework-react-app/context`](../app/docs/context.md) — app-developer-facing wrapper
