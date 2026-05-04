# Navigation

Set up client-side routing in your Fusion app using the framework-managed navigation module.

**Import:**

```ts
import { useRouter, useNavigationModule } from '@equinor/fusion-framework-react-app/navigation';
```

## Overview

The navigation module wraps React Router with Fusion's base path handling, ensuring your app's routes work correctly under the portal's URL structure (e.g. `/apps/my-app/...`). Use `useRouter` to create a router instance and pass it to `<RouterProvider>`.

> [!IMPORTANT]
> Do not use `createBrowserRouter` from React Router directly — it bypasses the Fusion base path and will cause routing conflicts inside the portal.

## Enable Navigation

The navigation module must be enabled in your app's configurator:

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

export const configure = (configurator) => {
  enableNavigation(configurator);
};
```

## useRouter

Creates a router instance from route definitions. The returned router is compatible with React Router's `<RouterProvider>`.

**Signature:**

```ts
function useRouter(routes: RouteObject[]): Router;
```

> [!CAUTION]
> **Routes must be stable or memoised.** If you pass a new array reference on every render, the router will be recreated each time, resetting navigation state. Define routes outside the component or use `useMemo`.

### Minimal Routing Example

```tsx
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';
import { RouterProvider } from 'react-router-dom';

const Home = () => <h1>Home</h1>;
const Settings = () => <h1>Settings</h1>;

// Define routes outside the component to keep them stable
const routes = [
  { path: '/', element: <Home /> },
  { path: '/settings', element: <Settings /> },
];

const App = () => {
  const router = useRouter(routes);
  return <RouterProvider router={router} />;
};
```

## useNavigationModule

Returns the navigation module provider instance directly. Use this for advanced scenarios where you need access to the full provider API (e.g. programmatic navigation outside of React Router's hooks).

**Signature:**

```ts
function useNavigationModule(): INavigationProvider;
```

**Throws** if the navigation module has not been enabled for the application.

## Prerequisites

- The navigation module must be enabled in your app's configurator via `enableNavigation`
- Do not mix `useRouter` with direct `createBrowserRouter` calls — use one approach consistently
