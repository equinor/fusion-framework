# Advanced Fusion app testing

The `/test` entry point extends Vitest's test context with `appEnv`, `configureApp`, `configureFusion`,
`fusion`, `app`, `render`, and `renderHook`. Fixture declarations are reusable, while each test
receives fresh framework and app module instances.

This guide covers composing and overriding those Fusion fixture values; see Vitest's own
[Test Context](https://vitest.dev/guide/test-context) documentation for fixture scope, cleanup,
and the general `test.extend`/`test.override` mechanics Fusion builds on.

## Choose a rendering API

| API | Use it when |
| --- | --- |
| `test` from `/test` | The app's manifest, config, and module configurator should resolve automatically |
| `render` from `/test` | A standard `describe` or `it` block needs the automatically resolved app scope |
| `renderAppHook` | A hook needs an app scope with explicitly supplied options |
| `renderAppComponent` | A component needs explicit `env`, `configureApp`, or parent `fusion` options |
| `testApp` | A reusable fixture should not depend on Vite's automatic app-file resolution |

All Fusion rendering APIs initialize modules asynchronously and must be awaited. The lower
level helpers return `fusion.framework` and `fusion.app`, allowing a test to drive the exact
module instances consumed by the rendered subject.

## Extend app configuration

Create one reusable extended test when several cases need the same deterministic modules.
This must extend `test` from `/test`, not `testApp` from the main entry point:
`testApp`'s `configureApp` defaults to `undefined` (no Vite dependency, so no way to load the
real `src/config.ts` as live code), while `/test`'s `test` seeds it with the app's real
`configure` export via `appTestVitePlugin`'s virtual modules.

```tsx
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

const project = {
  id: 'project-a',
  title: 'Project A',
  type: { id: 'ProjectMaster' },
  value: {},
};

export const test = baseTest.extend('configureApp', ({ configureApp }) => (configurator, args) => {
  configureApp?.(configurator, args);
  enableContextMock(configurator, (mock) => mock.setCurrentContext(project));
});
```

Composing the original `configureApp` fixture preserves the application's production module
configuration. See [Module mocks](module-mocks.md) for authentication, context, bookmark,
feature-flag, HTTP, analytics, and telemetry boundaries.

`.extend(...)` returns a new, separately exported `test` — reach for it when several test
*files* need the same fixture default. Within one file, prefer `test.override(...)` (below):
it replaces a fixture in place, so every test in that file keeps importing the same `test`.

## Fake an endpoint URL with `mergeEnvConfig`

`appEnv`'s `config` is an `AppConfig` instance — its `environment`/`endpoints` live behind
private fields exposed only through getters, so `{ ...appEnv.config, endpoints: {...} }` copies
nothing and silently drops the rest of the config. Use `mergeEnvConfig` to fake one endpoint's
URL (e.g. the app's real backend, resolved from `app.config.ts`) while keeping every other
endpoint and environment variable intact:

```tsx
import { mergeEnvConfig, test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

export const test = baseTest.extend('appEnv', ({ appEnv }) =>
  mergeEnvConfig(appEnv, { endpoints: { 'cpr-api': { url: backendBaseUrl } } }),
);
```

## Override a fixture for one test or a `describe` block

`test.override('name', ...)` replaces a fixture's resolved value without creating a new `test`
export. Called at the top of a `describe` block, the override applies to every test inside it
and does not leak to sibling blocks or other files — each `describe` starts from the file's
base `test` again. Called at the top of the file (outside any `describe`), it applies to every
test in that file.

**`configureApp`'s default value, from `/test`, *is* the app's real `src/config.ts` `configure`
export.** `test.override('configureApp', ...)` replaces that default outright — an override
that doesn't call the real `configure(configurator, args)` itself, as below, skips the app's
production module setup entirely rather than composing with it.

```tsx
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import { describe } from 'vitest';

import { configure } from '../config'; // the app's own, real module configurator

const project = { id: 'project-a', title: 'Project A', type: { id: 'ProjectMaster' }, value: {} };

describe('with an initial project', () => {
  test.override('configureApp', { injected: true }, () => (configurator, args) => {
    configure(configurator, args); // compose the app's real configure, same as `.extend`
    enableContextMock(configurator, (mock) => mock.setCurrentContext(project));
  });

  test('displays the initial context the app resolves on startup', async ({ render }) => {
    const { getByText } = await render(<App />);
    await expect.element(getByText(/project-a/)).toBeInTheDocument();
  });
});
```

`fusion` itself can be overridden the same way, when a case needs a differently configured
parent framework instance rather than a change to the app's own `configureApp`:

```tsx
describe('with a parent framework context', () => {
  test.override('fusion', async ({ appEnv }) =>
    mockFramework<[AppModule, ContextModule]>((configurator) => {
      enableAppManifestMock(configurator, appEnv);
      enableContextMock(configurator, (mock) => mock.setCurrentContext(project));
    }),
  );

  test('mirrors the context the parent sets', async ({ render, fusion }) => {
    /* ... */
  });
});
```

The `{ injected: true }` option matches the fixture's original declaration (see
`test-app.tsx`/`test.tsx`); it is not required for `.override(...)` itself, but keeping it
consistent avoids re-deriving whether the base fixture accepts a config-injected value. See
the [React context cookbook](../../../../cookbooks/app-react-context/src/App.test.tsx) and
[feature-flag cookbook](../../../../cookbooks/app-react-feature-flag/src/components/FeatureFlags.test.tsx)
for full working examples, and Vitest's own
[Test Context](https://vitest.dev/guide/test-context) guide for fixture scope and cleanup
mechanics beyond what Fusion adds.

## Supply a custom parent framework

Override or explicitly pass `fusion` when the scenario depends on portal-level context,
service discovery, authentication, or app manifests. Build the parent with `mockFramework`,
then initialize the app beneath it. This exercises parent-to-app propagation without a
running portal.

Use [`enableAppManifestMock`](../../../app/docs/testing.md#enableappmanifestmockconfigurator-env)
when the custom parent must serve the app's manifest and config. Use
[`mockFramework`](../../../framework/docs/testing.md) to seed the parent modules.

## Extend the parent framework mock with `configureFusion`

`fusion` (built by [`resolveFusion`](../src/scope/resolve-fusion.ts)) always carries a mocked
`app` module (serving this app's manifest) and a `navigation` module with real browser history,
matching Browser Mode. `configureFusion` runs on the same configurator afterwards, so a test can
register extra framework-level modules or override that setup, without reimplementing it:

```tsx
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';

const test = baseTest.extend('configureFusion', { injected: true }, () => (configurator) => {
  enableFeatureFlagMock(configurator);
  configurator.serviceDiscovery.addServices([{ key: 'people', uri: baseUrl('people') }]);
});
```

Note this is a **framework-scope** module set, distinct from the app-scope one `configureApp`
seeds. A typical app registers its own `navigation` module independently, inside its own
`config.ts`'s `configure` callback (what `configureApp` composes with) — so overriding history
through `configureFusion` only affects framework-scope consumers, such as
`useFramework<[NavigationModule]>().modules.navigation` or `useBookmarkNavigate`, not a
rendered app's own router:

```tsx
import { enableNavigation, createHistory } from '@equinor/fusion-framework-module-navigation';

test.override('configureFusion', { injected: true }, () => (configurator) =>
  enableNavigation(configurator, {
    configure: (config) => config.setHistory(createHistory('memory')),
  }),
);
```

**`.override('fusion', ...)` bypasses `configureFusion` entirely** — it replaces the resolver
that calls it, so a `configureFusion` override on the same test/suite is silently never called.
Reach for `configureFusion` to extend the base mock; reach for `fusion` only to replace it
outright (e.g. with a fully custom or non-mocked instance) — see
[Supply a custom parent framework](#supply-a-custom-parent-framework) above.

## Test routes and app lifecycle

Render the complete `App` when assertions depend on route loaders, navigation, app
configuration, or several modules working together. Set the initial browser URL before
rendering, interact through visible controls or `app.navigation`, and assert the rendered
result.

The [React router cookbook](../../../../cookbooks/app-react-router/README.md) demonstrates
route-unit tests, complete application navigation, and HTTP-backed loaders.

## Runner-level advanced behavior

Fusion does not wrap these Vitest capabilities:

- [Browser interactions and assertions](https://vitest.dev/guide/browser/)
- [Asynchronous tests](https://vitest.dev/guide/learn/async)
- [Test projects](https://vitest.dev/guide/projects)
- [Coverage](https://vitest.dev/guide/coverage)
- [Debugging](https://vitest.dev/guide/debugging)
