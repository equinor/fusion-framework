---
"@equinor/fusion-framework-app": minor
---

Add a `./mock` entry point: `mockAppModules` runs an application's real module pipeline — the real `event`/`http`/`msal` modules, the real `AppConfigurator` configuration pipeline and real lifecycle — against a mocked parent Fusion instance, so a test exercises the wiring an application actually depends on instead of a reimplementation of it.

```ts
import { mockAppModules } from '@equinor/fusion-framework-app/mock';

const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
const modules = await mockAppModules(undefined, { manifest });
```

`enableAppManifestMock` registers the `app` module on a parent `mockFramework` configurator, serving an app's own manifest and config while delegating every other request to whatever service discovery (or a pre-configured http client) would really resolve. `mockAppModules` uses it to build its zero-configuration default parent; call it directly when a test needs to customize `serviceDiscovery` first.

Restructured `README.md` into an entry point pointing at `docs/http-clients.md`, `docs/bookmarks.md` and `docs/testing.md`, matching the convention already used by `@equinor/fusion-framework-module-http` and `@equinor/fusion-framework-module-msal`.
