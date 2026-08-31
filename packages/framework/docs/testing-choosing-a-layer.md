# Choose a Fusion testing layer

Start with the smallest layer that initializes the production behavior the test needs. Fusion
test utilities substitute external boundaries; Vitest still owns tests, assertions, lifecycle
hooks, spies, timers, coverage, and general module mocking.

## Which import should I use?

| Testing intent | Start with | Import |
| --- | --- | --- |
| Pure function or framework-independent hook | Standard Vitest | `vitest` |
| React hook that consumes app modules | `renderAppHook` | `@equinor/fusion-framework-vitest-plugin-react-app` |
| React component, route, or complete Fusion app | Extended `test` and `render` fixture | `@equinor/fusion-framework-vitest-plugin-react-app/test` |
| Reusable app fixture without automatic app-file resolution | `testApp` | `@equinor/fusion-framework-vitest-plugin-react-app` |
| Application module configuration without React | `mockAppModules` | `@equinor/fusion-framework-app/mock` |
| Parent framework or portal-level modules | `mockFramework` | `@equinor/fusion-framework/mock` |
| One module in a bespoke module graph | That module's `enable*Mock` helper | `@equinor/fusion-framework-module-*/mock` |
| Named HTTP clients and a few deterministic responses | `configurator.http.addMiddleware` | Real HTTP configurator |
| Many HTTP operations described by OpenAPI | `createOpenApiMockMiddleware` | `@equinor/fusion-framework-module-http/mock` |
| One method call, timer, global, or JavaScript module | Vitest's `vi` APIs | `vitest` |

## React app tests

Use `@equinor/fusion-framework-vitest-plugin-react-app/test` for the normal application path.
Its `test` and `render` exports resolve the app's manifest, `app.config.ts`, and module
configurator, then initialize a fresh framework and app scope for each test.

```tsx
import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { App } from './App';

test('renders the app', async ({ render }) => {
  const screen = await render(<App />);
  await expect.element(screen.getByRole('heading')).toBeVisible();
});
```

Use the root entry point's `renderAppHook`, `renderAppComponent`, or `testApp` only when the
test should provide `env`, `configure`, or a parent `fusion` instance explicitly. See the
[`@equinor/fusion-framework-vitest-plugin-react-app` documentation](../../vitest-plugin/react-app/README.md).

## Framework and module tests

Use `mockFramework` when code consumes the parent framework directly or when the test needs
to seed several built-in framework modules together:

```ts
import { mockFramework } from '@equinor/fusion-framework/mock';

const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  configurator.context.setCurrentContext({
    id: 'project-a',
    title: 'Project A',
    type: { id: 'ProjectMaster' },
    value: {},
  });
  configurator.serviceDiscovery.addService({ key: 'catalog' });
});
```

Use a module-owned `/mock` entry point when assembling a custom module graph or testing the
module without the standard framework set. Module mocks keep the real provider,
configurator, validation, and lifecycle; only the client or data source that leaves the
process is substituted.

## Choosing how to fake data

| Need | Preferred boundary | Why |
| --- | --- | --- |
| One known context item | `enableContextMock` | Seeds domain data without transport setup |
| Context service integration | HTTP middleware | Exercises service discovery, HTTP, and context client behavior together |
| One or two HTTP routes | Hand-written `HttpMiddleware` | Keeps the response behavior explicit |
| An API described by OpenAPI | `createOpenApiMockMiddleware` | Generates deterministic responses for the whole specification |
| An individual client call | `vi.spyOn` | Uses the test runner's call assertions and reset semantics |

An HTTP middleware handles only matching requests. Calling `next(uri, init)` continues to the
next middleware and eventually the real network. Tests intended to be fully offline should
fail or answer every request they expect.

## Related package documentation

- [Framework mock usage](testing.md)
- [Framework mock design](testing-design.md)
- [Framework mock exports](testing-api.md)
- [Add a mock for a custom module](testing-extending.md)
- [Application module testing](../../app/docs/testing.md)
- [HTTP testing](../../modules/http/docs/testing.md)
- [Migrate an existing app to Fusion Vitest](../../vitest-plugin/react-app/docs/migrating-an-existing-app.md)
