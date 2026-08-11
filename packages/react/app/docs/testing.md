# Testing

Render app-scoped hooks and components against a real, mock-backed application module
scope using `renderAppHook` and `renderAppComponent`.

**Import:**

```ts
import { renderAppHook, renderAppComponent } from '@equinor/fusion-framework-react-app/testing';
```

> [!IMPORTANT]
> Requires `@testing-library/react` (optional peer dependency) to be installed.

## Overview

Any hook or component that reads from the application module scope — `useAppModule`,
`useAccessToken`, `useCurrentContext`, `useCurrentBookmark`, `useAppSetting`, and so on — or
from the parent framework via `useFramework`, needs to run inside the same provider nesting
`renderApp`/`createComponent` wire up in production: a `FrameworkProvider` (the parent Fusion
instance) around a `ModuleProvider` (the app's own modules).

`renderAppHook` and `renderAppComponent` build that nesting for you, using
`mockFramework` (`@equinor/fusion-framework/mock`) and `mockAppModules`
(`@equinor/fusion-framework-app/mock`) — the **real** `event`/`http`/`msal` module
pipeline. Only requests a seeded middleware answers are faked; a request with no
matching middleware still reaches the real network. This means:

- MSAL signs in a default "Test User" with zero configuration — `useAccessToken`/`useToken`
  resolve a real, structurally-valid (unsigned) JWT out of the box.
- `event` dispatches and listens for real `FrameworkEvent`s.
- Anything that talks to an HTTP endpoint (e.g. an app's own manifest, settings) is answered
  by a mock client rather than a real network call — see each hook's own docs for what's
  pre-wired versus what you need to seed yourself (e.g. via `enableBookmarkMock`,
  `enableContextMock`, `enableFeatureFlagMock`, or a `configurator.http.addMiddleware(...)`
  router).

Use `renderAppHook` for a hook in isolation; use `renderAppComponent` when you need to
assert on rendered output (e.g. loading/error states, DOM structure).

## renderAppHook

Renders a hook inside a real, mock-backed application module scope.

**Signature:**

```ts
function renderAppHook<Result, Props = undefined, TModules = unknown, TEnv extends AppEnv = AppEnv>(
  render: (initialProps: Props) => Result,
  options?: {
    configure?: AppMockConfigureFn<TModules, TEnv>;
    env?: TEnv;
    fusion?: Fusion;
  } & Omit<RenderHookOptions<Props>, 'wrapper'>,
): Promise<RenderHookResult<Result, Props>>;
```

| Option      | Description                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------|
| `configure` | Callback forwarded to `mockAppModules` for seeding app-scope modules (bookmark, context, feature-flag, msal, etc.) |
| `env`       | The application environment (manifest); defaults to a generic standalone `test-app`                                |
| `fusion`    | The parent Fusion instance; defaults to a fresh `mockFramework` instance serving this app's own manifest           |

Any other `renderHook` option (e.g. `initialProps`) is forwarded as-is.

### Basic Usage

```tsx
import { renderAppHook } from '@equinor/fusion-framework-react-app/testing';
import { waitFor } from '@testing-library/react';
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';

test('resolves an access token', async () => {
  const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
  await waitFor(() => expect(result.current.pending).toBe(false));
  expect(result.current.token).toBeDefined();
});
```

### Sign In a Named User

Pass `configure` to reach the msal mock's builder before the hook renders:

```tsx
import { renderAppHook } from '@equinor/fusion-framework-react-app/testing';
import { useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

test('reads the configured account', async () => {
  const { result } = await renderAppHook(() => useCurrentAccount(), {
    configure: (configurator) => configurator.msal.setAccount({ name: 'Ada Lovelace' }),
  });
  expect(result.current).toMatchObject({ name: 'Ada Lovelace' });
});
```

### Reuse a Pre-Built Parent Fusion Instance

Build the `fusion` instance yourself when a test needs to pre-configure parent-level
modules (`http`, `context`, `serviceDiscovery`) or share one instance across multiple render
calls:

```tsx
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { renderAppHook } from '@equinor/fusion-framework-react-app/testing';
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';
import { useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

const env = { manifest: { appKey: 'test-app', displayName: 'Test App', description: '', type: 'standalone' as const } };

test('shares one fusion instance across two renders', async () => {
  const fusion = await mockFramework<[AppModule]>((configurator) =>
    enableAppManifestMock(configurator, env),
  );

  const { result: a } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }), { fusion });
  const { result: b } = await renderAppHook(() => useCurrentAccount(), { fusion });
});
```

## renderAppComponent

Renders a component inside the same real, mock-backed application module scope as
`renderAppHook`. Use this when you need to assert on rendered output rather than a hook's
return value — e.g. a component with its own loading/error states.

**Signature:**

```ts
function renderAppComponent<TModules = unknown, TEnv extends AppEnv = AppEnv>(
  ui: ReactElement,
  options?: {
    configure?: AppMockConfigureFn<TModules, TEnv>;
    env?: TEnv;
    fusion?: Fusion;
  } & Omit<RenderOptions, 'wrapper'>,
): Promise<RenderResult>;
```

Options are the same shape as `renderAppHook`'s — `configure`, `env`, `fusion` — plus any
other `@testing-library/react` `render` option.

### Example: Asserting Loading and Error States

```tsx
import { waitFor } from '@testing-library/react';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppManifest, AppModule } from '@equinor/fusion-framework-module-app';
import { renderAppComponent } from '@equinor/fusion-framework-react-app/testing';
import { Apploader } from '@equinor/fusion-framework-react-app/apploader';

test('mounts the child app once its script loads', async () => {
  const manifest: AppManifest = {
    appKey: 'child-app',
    displayName: 'Child App',
    description: 'A child application',
    type: 'standalone',
    build: { version: '1.0.0', entryPoint: 'child-script.ts', assetPath: '' },
  };
  const fusion = await mockFramework<[AppModule]>((configurator) =>
    enableAppManifestMock(configurator, { manifest }, someFixturesUri),
  );

  const { container } = await renderAppComponent(<Apploader appKey="child-app" />, { fusion });

  // the loading state renders synchronously, before the script's dynamic import resolves
  expect(container.textContent).toContain('Loading child-app');
  await waitFor(() => expect(container.textContent).toContain('mounted: child-app'));
});

test('surfaces the load error instead of throwing when the script fails to import', async () => {
  const manifest: AppManifest = {
    appKey: 'broken-app',
    displayName: 'Broken App',
    description: 'An application whose build entry point does not exist',
    type: 'standalone',
    build: { version: '1.0.0', entryPoint: 'does-not-exist.ts', assetPath: '' },
  };
  const fusion = await mockFramework<[AppModule]>((configurator) =>
    enableAppManifestMock(configurator, { manifest }, someFixturesUri),
  );

  const { container } = await renderAppComponent(<Apploader appKey="broken-app" />, { fusion });

  await waitFor(() => expect(container.textContent).toContain('Error loading broken-app'));
});
```

## Notes

- Both helpers are `async` — always `await` them, since the mocked application module scope
  (app manifest, module initialization) resolves asynchronously before the first render.
- Seeding a module beyond the default set (bookmark, context, feature-flag) requires its own
  mock enabler passed through `configure` — e.g. `enableBookmarkMock`, `enableContextMock`,
  `enableFeatureFlagMock` from that module's own `/mock` sub-path.
- `msal` ships enabled by default with a signed-in "Test User" — no `configure` needed unless
  a test cares about a specific account or a signed-out state.
- Prefer these helpers over hand-wiring `mockFramework`, `mockAppModules`,
  `FrameworkProvider`, and `ModuleProvider` directly in every test.
