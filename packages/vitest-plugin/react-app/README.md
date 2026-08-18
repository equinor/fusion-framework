# @equinor/fusion-framework-vitest-plugin-react-app

Vite plugin and Vitest helpers for testing Fusion Framework React applications inside a real,
mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting
`renderApp`/`createComponent` wire up in production, with the real `event`/`http`/`msal` module
pipeline and only the network boundary faked.

> **Note:** Requires `vitest-browser-react` (peer dependency) and Vitest's
> [Browser Mode](https://vitest.dev/guide/browser/) configured for the project — these render
> helpers mount real components in a real browser, not `happy-dom`/`jsdom`.

Use this package when you need to:

- **Render a component or hook against real application modules** — `useAppModule`,
  `useAccessToken`, `useCurrentContext`, `useCurrentBookmark`, `useAppSetting`, and similar
  hooks resolve for real, instead of being hand-mocked per test.
- **Test against the application's own manifest, config, and module-configurator** — the same
  resolution pipeline `ffc app build`/`ffc app dev` use, served as virtual modules by
  `appTestVitePlugin`.
- **Share seeded fixture defaults across a test file** — `testApp`, a `vitest` `test` extended
  with `env`/`configureApp`/`app`/`render`/`renderHook` fixtures, instead of repeating options on
  every call. Each test still gets its own fresh `fusion`/`app` instances; only the seeded
  defaults are shared, not state between tests.

## Installation

```sh
pnpm add -D vitest playwright @vitest/browser-playwright vitest-browser-react \
  @equinor/fusion-framework-vitest-plugin-react-app
pnpm exec playwright install chromium
```

React, React DOM, RxJS, and Vite are peer dependencies normally supplied by the app.

## Documentation

| Task | Guide |
| --- | --- |
| Understand the package and choose a subject | [Overview](docs/overview.md) |
| Install, configure, and run the first app test | [Getting started](docs/getting-started.md) |
| Override Vitest defaults or resolve non-standard app files | [Configuration](docs/configuration.md) |
| Compose fixtures, explicit render options, and app lifecycle tests | [Advanced usage](docs/advanced.md) |
| Diagnose setup, browser, app-resolution, and network failures | [Troubleshooting](docs/troubleshooting.md) |
| Seed authentication, context, bookmarks, feature flags, HTTP, analytics, and telemetry | [Module mocks](docs/module-mocks.md) |
| Understand the Browser Mode default or choose another renderer | [Why Browser Mode is the default](docs/why-browser-mode.md) |
| Move an existing `@testing-library/react`/jsdom suite onto this package | [Migrate an existing app](docs/migrating-an-existing-app.md) |
| Choose between app, framework, module, HTTP, and runner-level tests | [Choose a testing layer](../../framework/docs/testing-choosing-a-layer.md) |

## Overview

Any hook or component that reads from the application module scope — `useAppModule`,
`useAccessToken`, `useCurrentContext`, `useCurrentBookmark`, `useAppSetting`, and so on — or
from the parent framework via `useFramework`, needs to run inside the same provider nesting
`renderApp`/`createComponent` wire up in production: a `FrameworkProvider` (the parent Fusion
instance) around a `ModuleProvider` (the app's own modules).

`renderAppHook` and `renderAppComponent` build that nesting for you, using `mockFramework`
(`@equinor/fusion-framework/mock`) and `mockAppModules` (`@equinor/fusion-framework-app/mock`) —
the **real** `event`/`http`/`msal` module pipeline. Only requests a seeded middleware answers
are faked; a request with no matching middleware still reaches the real network. This means:

- MSAL signs in a default "Test User" with zero configuration — `useAccessToken`/`useToken`
  resolve a real, structurally-valid (unsigned) JWT out of the box.
- `event` dispatches and listens for real `FrameworkEvent`s.
- Anything that talks to an HTTP endpoint (e.g. an app's own manifest, settings) is answered
  by a mock client rather than a real network call — see each hook's own docs for what's
  pre-wired versus what you need to seed yourself (e.g. via `enableBookmarkMock`,
  `enableContextMock`, `enableFeatureFlagMock`, or a `configurator.http.addMiddleware(...)`
  router).

Use `renderAppHook` for a hook in isolation; use `renderAppComponent` when you need to assert
on rendered output (e.g. loading/error states, DOM structure); use `testApp` or the `/test`
entry-point's `test`/`render` when several cases in a file share one seeded scope.

## Entry points

- **`@equinor/fusion-framework-vitest-plugin-react-app`** — `appTestVitePlugin`,
  `renderAppComponent`, `renderAppHook`, `testApp`. No app-specific resolution; you pass
  `env`/`configure` yourself.
- **`@equinor/fusion-framework-vitest-plugin-react-app/test`** — `test`, `render`. Require
  `appTestVitePlugin` registered in `vitest.config.ts`; `env`/`configureApp` are resolved
  automatically from the application's own manifest, config, and module-configurator.
- **`@equinor/fusion-framework-vitest-plugin-react-app/config`** — `defineProject`. Registers
  `appTestVitePlugin`, headless Playwright/Chromium, test-file inclusion, and lazy-import
  warmup while accepting ordinary Vitest configuration overrides.

## Quick start

Use the browser-ready project config in your app's `vitest.config.ts`:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

export default defineProject();
```

Then use the pre-seeded `test` fixture — no per-test `env`/`configureApp` wiring:

```tsx
import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { App } from '../App';

test('renders the app', async ({ render }) => {
  const screen = await render(<App />);
  await expect.element(screen.getByRole('heading')).toBeVisible();
});
```

Or, in a plain `describe`/`it` file, the equivalent `render` function:

```tsx
import { describe, expect, it } from 'vitest';
import { render } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { App } from '../App';

describe('App', () => {
  it('renders the app', async () => {
    const { getByRole } = await render(<App />);
    await expect.element(getByRole('heading')).toBeVisible();
  });
});
```

## renderAppHook

Renders a hook inside a real, mock-backed application module scope.

**Signature:**

```ts
function renderAppHook<Result, Props = undefined, TModules = unknown, TEnv extends AppEnv = AppEnv>(
  render: (initialProps?: Props) => Result,
  options?: {
    configure?: AppMockConfigureFn<TModules, TEnv>;
    env?: TEnv;
    fusion?: Fusion;
  } & Omit<RenderHookOptions<Props>, 'wrapper'>,
): Promise<RenderHookResult<Result, Props> & { fusion: { framework: Fusion; app: AppModulesInstance<TModules> } }>;
```

| Option      | Description                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------|
| `configure` | Callback forwarded to `mockAppModules` for seeding app-scope modules (bookmark, context, feature-flag, msal, etc.) |
| `env`       | The application environment (manifest); defaults to a generic standalone `test-app`                                |
| `fusion`    | The parent Fusion instance; defaults to a fresh `mockFramework` instance serving this app's own manifest           |

Any other `renderHook` option (e.g. `initialProps`) is forwarded as-is. The result carries the
usual `renderHook` return values (`result`, `rerender`, `unmount`) plus `fusion` — the same
instances the hook rendered against — for driving a module the hook itself doesn't return.

### Basic usage

```tsx
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';

test('resolves an access token', async () => {
  const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
  await vi.waitFor(() => expect(result.current.pending).toBe(false));
  expect(result.current.token).toBeDefined();
});
```

### Sign in a named user

Pass `configure` to reach the msal mock's builder before the hook renders:

```tsx
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

test('reads the configured account', async () => {
  const { result } = await renderAppHook(() => useCurrentAccount(), {
    configure: (configurator) => configurator.msal.setAccount({ name: 'Ada Lovelace' }),
  });
  expect(result.current).toMatchObject({ name: 'Ada Lovelace' });
});
```

### Reuse a pre-built parent Fusion instance

Build the `fusion` instance yourself when a test needs to pre-configure parent-level modules
(`http`, `context`, `serviceDiscovery`) or share one instance across multiple render calls:

```tsx
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { useAccessToken, useCurrentAccount } from '@equinor/fusion-framework-react-app/msal';

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
): Promise<RenderResult & { fusion: { framework: Fusion; app: AppModulesInstance<TModules> } }>;
```

Options are the same shape as `renderAppHook`'s — `configure`, `env`, `fusion` — plus any other
`vitest-browser-react` `render` option. The result carries the usual `render` return values
(`getByText`, `container`, `unmount`, ...) plus `fusion` — nested rather than spread directly
onto the result, so `vitest-browser-react`'s own return shape stays free to evolve without ever
colliding with it. `fusion.app` is the same application module instance the rendered component
reads through `useAppModule`/`useAppModules`, and `fusion.framework` is the parent Fusion
instance. Drive a module directly through `fusion.app` to exercise a state change after the
initial render, without hand-wiring `mockAppModules`/`ModuleProvider`:

```tsx
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { act } from 'react';
import { renderAppComponent } from '@equinor/fusion-framework-vitest-plugin-react-app';

test('reacts when the current context switches', async () => {
  const { getByText, fusion } = await renderAppComponent<[ContextModule]>(<App />, {
    configure: (configurator) =>
      enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
  });

  await act(() => fusion.app.context.setCurrentContextByIdAsync(projectB.id));
  await expect.element(getByText(/project-b/)).toBeVisible();
});
```

### Example: asserting loading and error states

```tsx
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppManifest, AppModule } from '@equinor/fusion-framework-module-app';
import { renderAppComponent } from '@equinor/fusion-framework-vitest-plugin-react-app';
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
  await vi.waitFor(() => expect(container.textContent).toContain('mounted: child-app'));
});
```

## testApp

`vitest`'s `test`, extended with an application module scope fixture — an alternative to
`renderAppComponent`/`renderAppHook` for a test file whose cases share one mocked scope:
`env`/`configureApp` become suite-level concerns, overridden once per file (or per `describe`
block) with `testApp.extend(...)`, rather than an options object repeated on every call.
`fusion`/`app` resolve lazily — a test that only destructures `app` never pays for rendering
anything, and one that only destructures `render`/`renderHook` gets the same mocked scope
wired in automatically.

```tsx
import { testApp } from '@equinor/fusion-framework-vitest-plugin-react-app';

testApp('resolves current context', async ({ app, render }) => {
  const screen = await render(<App />);
  expect(app.context).toBeDefined();
});
```

Seed a module for every test in a suite:

```tsx
describe('with a seeded context module', () => {
  const test = testApp.extend('configureApp', { injected: true }, () =>
    (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
  );

  test('starts on the seeded context', async ({ render }) => {
    const screen = await render(<App />);
    await expect.element(screen.getByText(projectA.title)).toBeVisible();
  });
});
```

## appTestVitePlugin

A plain Vite plugin — Vitest configs are Vite configs, so this registers directly in your own
`vitest.config.ts`, no CLI command required. It serves an application's manifest/config
(resolved the same way `ffc app build`/`ffc app dev` do) and its own module-configurator
export as virtual modules, so the `/test` entry-point's `test`/`render` need no per-test
`env`/`configureApp` wiring.

```ts
appTestVitePlugin({
  entrypoint?: string; // defaults to the resolved Vite/Vitest project root
  manifest?: string | AppManifestFn;
  config?: string | AppConfigFn;
  configure?: string; // defaults to the first of src/config.ts, src/config.tsx, src/config.js
});
```

`entrypoint`, `manifest`, and `config` are forwarded to the same manifest/config resolution
`ffc app build`/`ffc app dev` use (a base manifest generated from `package.json`, merged with a
local `app.manifest.ts` if one exists, plus `app.config.ts` for endpoints). `configure` points
at the application's module-configurator file — unlike `manifest`/`config`, it must be a real
file on disk, since it's re-exported as live application code into the test bundle rather than
JSON-serialized data. An explicitly requested `manifest`/`config`/`configure` file that doesn't
exist throws `FileNotFoundError`; the convention-based lookups fail silently and fall back to
defaults instead.

## Notes

- Every render/hook helper is `async` — always `await` it, since the mocked application module
  scope (app manifest, module initialization) resolves asynchronously before the first render.
- Seeding a module beyond the default set (bookmark, context, feature-flag) requires its own
  mock enabler passed through `configure` — e.g. `enableBookmarkMock`, `enableContextMock`,
  `enableFeatureFlagMock` from that module's own `/mock` sub-path.
- `msal` ships enabled by default with a signed-in "Test User" — no `configure` needed unless
  a test cares about a specific account or a signed-out state.
- Prefer these helpers over hand-wiring `mockFramework`, `mockAppModules`, `FrameworkProvider`,
  and `ModuleProvider` directly in every test.
