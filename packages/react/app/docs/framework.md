# Framework

Access framework-level (portal/host) context and services from within your app.

**Import:**

```ts
import { useFrameworkCurrentContext, useFramework, useCurrentUser, useFrameworkHttpClient } from '@equinor/fusion-framework-react-app/framework';
```

## When to Use

Most apps should use the **app-scoped** hooks from [`/context`](./context.md). The framework sub-path is for specific cases where you need data from the portal/host level, regardless of your app's own module configuration.

> [!NOTE]
> **Prefer `/context` unless you specifically need framework-level context.**
>
> `useCurrentContext` (from `/context`) reads from your app's own context module.
> `useFrameworkCurrentContext` (this sub-path) reads from the portal's context, bypassing your app's context module entirely.

## useFrameworkCurrentContext

Returns the currently selected context from the **framework-level** context module — the portal or host application's context, not your app's.

Use this when your app hasn't configured its own context module but still needs to read what context the portal has selected.

**Signature:**

```ts
function useFrameworkCurrentContext(): ContextItem | undefined;
```

**Returns:** The current framework context, or `undefined` if none is selected.

**Example:**

```tsx
import { useFrameworkCurrentContext } from '@equinor/fusion-framework-react-app/framework';

const PortalContextInfo = () => {
  const context = useFrameworkCurrentContext();

  if (!context) return <p>No portal context selected</p>;

  return <p>Portal context: {context.title}</p>;
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
function useFrameworkHttpClient(name: string): IHttpClient;
```

## App-Scoped vs Framework-Scoped

| Need                                          | Use                        | Sub-path      |
| --------------------------------------------- | -------------------------- | ------------- |
| Context your app configured                   | `useCurrentContext`        | `/context`    |
| Portal-level context (no app context module)   | `useFrameworkCurrentContext` | `/framework` |
| App-specific HTTP client                       | `useHttpClient`            | `/http`       |
| Portal-level HTTP client                       | `useFrameworkHttpClient`   | `/framework`  |
