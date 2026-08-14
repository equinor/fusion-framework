# Advanced Fusion app testing

The `/test` entry point extends Vitest's test context with `env`, `configure`, `fusion`, `app`,
`render`, and `renderHook`. Fixture declarations are reusable, while each test receives fresh
framework and app module instances.

Use Vitest's [Test Context](https://vitest.dev/guide/test-context) documentation for fixture
scope, cleanup, and override mechanics. This guide covers the Fusion fixture values and
selection rules.

## Choose a rendering API

| API | Use it when |
| --- | --- |
| `test` from `/test` | The app's manifest, config, and module configurator should resolve automatically |
| `render` from `/test` | A standard `describe` or `it` block needs the automatically resolved app scope |
| `renderAppHook` | A hook needs an app scope with explicitly supplied options |
| `renderAppComponent` | A component needs explicit `env`, `configure`, or parent `fusion` options |
| `testApp` | A reusable fixture should not depend on Vite's automatic app-file resolution |

All Fusion rendering APIs initialize modules asynchronously and must be awaited. The lower
level helpers return `fusion.framework` and `fusion.app`, allowing a test to drive the exact
module instances consumed by the rendered subject.

## Extend app configuration

Create one reusable extended test when several cases need the same deterministic modules:

```tsx
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

const project = {
  id: 'project-a',
  title: 'Project A',
  type: { id: 'ProjectMaster' },
  value: {},
};

export const test = baseTest.extend('configure', ({ configure }) => (configurator, args) => {
  configure?.(configurator, args);
  enableContextMock(configurator, (mock) => mock.setCurrentContext(project));
});
```

Composing the original `configure` fixture preserves the application's production module
configuration. See [Module mocks](module-mocks.md) for authentication, context, bookmark,
feature-flag, HTTP, analytics, and telemetry boundaries.

## Supply a custom parent framework

Override or explicitly pass `fusion` when the scenario depends on portal-level context,
service discovery, authentication, or app manifests. Build the parent with `mockFramework`,
then initialize the app beneath it. This exercises parent-to-app propagation without a
running portal.

Use [`enableAppManifestMock`](../../../app/docs/testing.md#enableappmanifestmockconfigurator-env)
when the custom parent must serve the app's manifest and config. Use
[`mockFramework`](../../../framework/docs/testing.md) to seed the parent modules.

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
