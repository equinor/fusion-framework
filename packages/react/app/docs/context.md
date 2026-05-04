# Context

Read the currently selected Fusion context (project, facility, etc.) from your app using the app-scoped context hooks.

**Import:**

```ts
import { useCurrentContext, useContextProvider } from '@equinor/fusion-framework-react-app/context';
```

## Overview

Fusion apps operate within a **context** — typically a project or facility selected by the user in the portal. The `useCurrentContext` hook returns the active context from your app's own context module. If no context is selected, it returns `undefined`.

> [!IMPORTANT]
> **App-scoped vs Framework-scoped context**
>
> - `useCurrentContext` (this sub-path) reads from the **app's own context module**. Your app must have the context module enabled.
> - `useFrameworkCurrentContext` (from `/framework`) reads from the **portal/host-level context**, regardless of whether your app has its own context module.
>
> **Prefer `useCurrentContext`** unless you specifically need portal-level context.

## useCurrentContext

Returns the currently selected context from the application-scoped context module.

**Signature:**

```ts
function useCurrentContext(): ContextItem | undefined;
```

**Returns:** The current context object, or `undefined` if no context is selected.

### Example

```tsx
import { useCurrentContext } from '@equinor/fusion-framework-react-app/context';

const ProjectHeader = () => {
  const context = useCurrentContext();

  if (!context) {
    return <p>No context selected</p>;
  }

  return (
    <header>
      <h1>{context.title}</h1>
      <span>Type: {context.type.id}</span>
    </header>
  );
};
```

## useContextProvider

Returns the app-scoped context module provider instance directly. Use this when you need to interact with the context module beyond just reading the current value — for example, querying available contexts or subscribing to context changes.

**Signature:**

```ts
function useContextProvider(): ContextModuleInstance;
```

**Throws** if the context module is not registered in the application scope.

### Example

```tsx
import { useContextProvider } from '@equinor/fusion-framework-react-app/context';

const ContextDebug = () => {
  const contextProvider = useContextProvider();
  // Access the full provider API
  return <pre>{JSON.stringify(contextProvider.currentContext, null, 2)}</pre>;
};
```

## Prerequisites

- The context module must be enabled in your app's configurator
- The `useFrameworkCurrentContext` hook is also re-exported from this sub-path for convenience — see the [framework docs](./framework.md) for details
