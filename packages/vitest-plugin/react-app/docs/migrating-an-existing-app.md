# Migrate an existing app to Fusion Vitest

Use this guide to move existing application tests to
`@equinor/fusion-framework-vitest-plugin-react-app`. It covers suites built with
`@testing-library/react`, `jsdom` or `happy-dom`, hand-written Fusion hook mocks, and mock HTTP
servers such as MirageJS, MSW, or Nock.

You can migrate one test at a time. A mixed suite is a valid final state.

## Choose which tests to migrate

Start with tests that read from the application module scope through
`useAppModule`, `useAccessToken`, `useCurrentContext`, `useCurrentBookmark`, `useFeature`, or a
route that uses several Fusion modules. The plugin can replace their hand-written hook mocks
with the real module pipeline and supported `enable*Mock` configuration.

Keep pure functions, presentational components, and hooks with no Fusion dependency on their
current runner when that is simpler. A test can also use the real Fusion module setup without
Browser Mode by providing its own renderer. See
[Why Browser Mode is the default](why-browser-mode.md#choose-a-different-runtime).

## What changes, concretely

| Existing pattern | Replace with |
| --- | --- |
| `@testing-library/react`'s `render`/`renderHook`/`waitFor`/`act`, on `jsdom` or `happy-dom` | `vitest-browser-react`'s `render`/`renderHook` and `vitest`'s `waitFor`/`act`, on real Chromium (Vitest Browser Mode) |
| `vi.mock('@equinor/fusion-framework-react/hooks', ...)`, `vi.mock('.../feature-flag', ...)`, and similar hand-rolled Fusion hook mocks | The owning module's `enable*Mock` from its own `/mock` entry point. See [Module mocks](module-mocks.md) |
| A hand-written mock HTTP server (MirageJS, `msw/node`, `nock`) answering every backend call | `configurator.http.addMiddleware(...)` with a hand-written `HttpMiddleware`, or `createRouterMiddleware` for several routes under one base URI. See [HTTP testing](../../../modules/http/docs/testing.md) |
| A hand-rolled test wrapper composing a router, context providers, and error boundaries around every render | `test.extend(...)` fixtures stacked on the base `render`/`configureApp` fixtures. See [Compose a router and a domain fixture](#compose-a-router-and-a-domain-fixture) below |
| Synchronous assertions (`expect(screen.getByText(...))`) | Browser locators and `await expect.element(screen.getByText(...)).toBeVisible()` |

## Step 1: install Browser Mode dependencies

```sh
pnpm add -D vitest playwright @vitest/browser-playwright vitest-browser-react \
  @equinor/fusion-framework-vitest-plugin-react-app
pnpm exec playwright install chromium
```

Remove `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, and
whichever `jsdom`/`happy-dom` package the app installed once every test that used them has
migrated. Keep them if part of the suite intentionally stays on the old renderer.

Replace the app's `vitest.config.ts` with the plugin's project config:

```ts
import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

export default defineProject();
```

`defineProject` registers `appTestVitePlugin`, enables headless Chromium, includes
`src/**/*.{test,spec}.{ts,tsx}`, and warms application source so lazy route imports don't reload
the browser mid-test. See [Configuration](configuration.md) for overriding any of that.

## Step 2: replace hand-rolled Fusion hook mocks

The `/test` entry point initializes the real module pipeline. This removes most `vi.mock`
implementations for hooks such as `useCurrentUser`, `useFeature`, and `useHttpClient`. The
default setup includes a signed-in `Test User` and initialized feature-flag, context, and
bookmark modules:

```diff
-vi.mock('@equinor/fusion-framework-react/hooks', async (importOriginal) => ({
-  ...(await importOriginal()),
-  useCurrentUser: vi.fn(() => undefined),
-}));
-vi.mock('@equinor/fusion-framework-react-app/feature-flag', () => ({
-  useFeature: vi.fn(() => ({})),
-}));
+import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';
+import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
+
+export const test = baseTest.extend('configureApp', ({ configureApp }) => (configurator, args) => {
+  configureApp?.(configurator, args);
+  configurator.msal.setAccount(null); // was: useCurrentUser returning undefined
+  enableFeatureFlagMock(configurator, (mock) => mock.addFeature({ key: 'new-search', enabled: true }));
+});
```

Each Fusion module owns its own mock entry point: `enableMsalMock`/`configurator.msal`,
`enableFeatureFlagMock`, `enableContextMock`, `enableBookmarkMock`, and more. See
[Module mocks](module-mocks.md) for the full list and each one's defaults. A hook or a small
piece of app config with no Fusion dependency (for example, reading `environment` from the
app's own manifest) stays a plain `vi.mock`.

Some suites override `useModuleCurrentContext` directly and change its return value with
`vi.spyOn`. Replace the initial value with `enableContextMock`. To change context after render,
call the real module:
`await fusion.app.context.setCurrentContextByIdAsync(otherProject.id)`. See the first
[`renderAppComponent`](../README.md#renderappcomponent) example.

## Step 3: port the mock HTTP server

Use `createRouterMiddleware` for a mock server that handles several routes under one base URL:

```diff
-import { createServer } from 'miragejs';
-
-export function createTestServer() {
-  return createServer({
-    routes() {
-      this.get('/activities/:id', (schema, request) => ({ id: request.params.id, ... }));
-      this.post('/activities', (schema, request) => ({ ... }));
-    },
-  });
-}
+import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';
+
+export const activityRoutes = createRouterMiddleware('https://cpr-api.example.com', (router) => {
+  router.get('/activities/:id', ({ params }) => Response.json({ id: params.id /* ... */ }));
+  router.post('/activities', async ({ request }) => Response.json({ /* ... */ }));
+});
```

Register the result with `configurator.http.addMiddleware(activityRoutes)` inside a `configureApp`
fixture (see step 4). Port one route file at a time. Each ported file is independently testable.
An unported route can fall through to the real network, so keep the old interceptor
for tests that have not migrated yet or add a final fail-closed middleware; do not rely on a
missing route to fail by itself. If the backend has an OpenAPI document, prefer
`createOpenApiMockMiddleware` (`@equinor/fusion-framework-module-http/mock`) over hand-written
routes; see [HTTP testing](../../../modules/http/docs/testing.md).

If `useHttpClient` currently returns a plain `fetch` wrapper, remove that hook mock as well. The
real client reaches middleware registered with `configurator.http.addMiddleware`. Register the
router for the base URI used by the real client.

## Compose a router and a domain fixture

Use a `render` extension for JSX wrappers such as routers and app-owned React providers. Use a
`configureApp` extension for Fusion module state. Stack both extensions when a test needs both:

```tsx
import type { ReactElement } from 'react';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { Router } from '@equinor/fusion-framework-react-router';
import type { RouteObject } from '@equinor/fusion-framework-react-router';
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';

// Every route matches, so the element under test stays mounted.
const testWithRouter = baseTest.extend('render', () => (ui: ReactElement) => {
  const routes: RouteObject[] = [{ path: '*', Component: () => ui }];
  return baseTest.render(<Router routes={routes} />);
});

// The domain fixture uses the same shape as any other `configureApp` extension.
export const test = testWithRouter.extend('configureApp', ({ configureApp }) => (configurator, args) => {
  configureApp?.(configurator, args);
  enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA));
});
```

A test importing this `test` gets both the router wrapper and seeded Fusion context.

Keep app-owned React providers, such as authorization, schema, or snackbar providers, in the
`render` extension. Move only Fusion module state to `configureApp` and `enable*Mock`.

## Step 4: update renders and assertions

Every render/hook helper is `async`, and most assertion helpers from `vitest-browser-react`
resolve against the real browser rather than synchronously:

```diff
-const { findByTestId } = render(<WrappedProcessPage {...props} />);
-await findByTestId('customization-panel');
+const { getByTestId } = await render(<WrappedProcessPage {...props} />);
+await expect.element(getByTestId('customization-panel')).toBeVisible();
```

`fireEvent`-style interactions become element method calls (`await screen.getByRole('button', {
name: 'Activate' }).click()`), and `act`/`waitFor` come from `vitest` rather than
`@testing-library/react`. See the [Vitest Browser Mode](https://vitest.dev/guide/browser/) and
[mocking](https://vitest.dev/guide/mocking) guides for the general-purpose parts of this that
aren't Fusion-specific.

## Step 5: reassess DOM-emulation-only workarounds

Review polyfills and component replacements that may only exist for `jsdom` or `happy-dom`.
Remove one workaround at a time and run the affected tests against the real component.

Do not remove unrelated suppressions automatically. AG Grid license messages, Lit dev-mode
warnings, network behavior, and app-specific test doubles may still apply in Browser Mode.

## Migrate incrementally

Nothing requires migrating a whole app in one pass. A common order: pick one page or route-level
test that already hand-mocks several Fusion hooks, migrate it end to end (steps 1-4 above),
confirm it's green, then migrate the next. Leave tests with no Fusion dependency on their
current renderer for as long as that remains the cheaper option.

## Related documentation

- [Choose a Fusion testing layer](../../../framework/docs/testing-choosing-a-layer.md)
- [Module mocks](module-mocks.md)
- [HTTP testing](../../../modules/http/docs/testing.md)
- [Advanced usage](advanced.md): composing fixtures and explicit render options
- [Troubleshooting](troubleshooting.md)
