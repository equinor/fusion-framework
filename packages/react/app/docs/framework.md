# Framework

Access framework-level (portal/host) context and services from within your app.

**Import:**

```ts
import { useFramework, useCurrentUser, useFrameworkHttpClient } from '@equinor/fusion-framework-react-app/framework';
// useFrameworkCurrentContext is exported from the /context sub-path:
import { useFrameworkCurrentContext } from '@equinor/fusion-framework-react-app/context';
```

## When to Use

Most apps should use the **app-scoped** hooks from the `/context` sub-path (`@equinor/fusion-framework-react-app/context`). The framework sub-path is for specific cases where you need data from the portal/host level, regardless of your app's own module configuration.

> [!NOTE]
> **Prefer `/context` unless you specifically need framework-level context.**
>
> `useCurrentContext` (from `/context`) reads from your app's own context module.
> `useFrameworkCurrentContext` (also from `/context`) reads from the portal's context, bypassing your app's context module entirely.

## useFrameworkCurrentContext

Returns the currently selected context from the **framework-level** context module — the portal or host application's context, not your app's.

Use this when your app hasn't configured its own context module but still needs to read what context the portal has selected.

**Signature:**

```ts
function useFrameworkCurrentContext(): {
  currentContext: ContextItem | undefined;
  setCurrentContext: (entry?: ContextItem | string | null) => void;
};
```

**Returns:** An object with `currentContext` (the portal's active context, or `undefined` if none is selected) and `setCurrentContext` to change it.

**Example:**

```tsx
import { useFrameworkCurrentContext } from '@equinor/fusion-framework-react-app/context';

const PortalContextInfo = () => {
  const { currentContext } = useFrameworkCurrentContext();

  if (!currentContext) return <p>No portal context selected</p>;

  return <p>Portal context: {currentContext.title}</p>;
};
```

## useFramework

Returns the Fusion framework instance directly, giving access to all framework-level modules.

**Signature:**

```ts
function useFramework(): Fusion;
```

## useCurrentUser

Returns the currently authenticated user from the framework.

**Signature:**

```ts
function useCurrentUser(): AccountInfo | undefined;
```

## useFrameworkHttpClient

Returns an HTTP client from the framework-level HTTP module (not your app's configured clients). Useful for accessing portal-provided API clients.

**Signature:**

```ts
function useFrameworkHttpClient(name: 'portal' | 'people'): IHttpClient;
```

**Throws** if no client is configured for the given key.

## App-Scoped vs Framework-Scoped

| Need                                          | Use                          | Sub-path      |
| --------------------------------------------- | ---------------------------- | ------------- |
| Context your app configured                   | `useCurrentContext`          | `/context`    |
| Portal-level context (no app context module)  | `useFrameworkCurrentContext` | `/context`    |
| App-specific HTTP client                      | `useHttpClient`              | `/http`       |
| Portal-level HTTP client                      | `useFrameworkHttpClient`     | `/framework`  |
