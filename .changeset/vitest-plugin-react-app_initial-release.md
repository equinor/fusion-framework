---
"@equinor/fusion-framework-vitest-plugin-react-app": minor
---

Add `@equinor/fusion-framework-vitest-plugin-react-app`: Vitest/`vitest-browser-react` helpers for testing a Fusion Framework React application inside a real, mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp`/`createComponent` wire up in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`).

```tsx
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';

const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
await vi.waitFor(() => expect(result.current.pending).toBe(false));
```

Highlights:

- `renderAppHook`/`renderAppComponent` — render a hook or component against the real `event`/`http`/`msal` module pipeline, with only the network boundary faked; the result carries a nested `fusion: { framework, app }` for driving a module directly after the initial render.
- `testApp` — a `vitest` `test` extended with `appEnv`/`configureApp`/`configureFusion`/`app`/`render`/`renderHook` fixtures, for a test file whose cases share one mocked scope. `configureApp` composes with the base app-module mock; `configureFusion` composes with the base parent-framework mock (app manifest and navigation) for extending framework-scope modules such as feature flags, service discovery, or navigation history.
- `appTestVitePlugin` — a Vite plugin resolving an application's own manifest, config, and module-configurator (the same pipeline `ffc app build`/`ffc app dev` use) as virtual modules, with `entrypoint` inferred from the Vitest project's own root (via `configResolved`) when not given explicitly, so each cookbook's `vitest.config.ts` needs no `entrypoint` override when run as part of a multi-project Vitest run.
- A `/test` entry-point exporting `test`/`render`, pre-seeded from the resolved manifest/config/configure once `appTestVitePlugin` is registered — no per-test `env`/`configure` wiring — plus `mergeEnvConfig` for overriding one endpoint's URL (or an `environment` value) on `appEnv` without dropping the rest of the app's `AppConfig`.
- A `/config` entry-point exporting `defineProject`: a drop-in for Vitest's own `defineProject`, pre-wired with `appTestVitePlugin` and the `@vitest/browser-playwright`/`chromium` browser provider, so a consuming app's own `vitest.config.ts` needs no browser-provider boilerplate:

  ```ts
  import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
  import { name, version } from './package.json' with { type: 'json' };

  export default defineProject({ test: { name: `${name}@${version}` } });
  ```

  `defineProject` defaults `test.browser.viewport` to `1024x768` instead of Vitest's own mobile-sized default, matching the low, fixed resolution most Fusion apps see in production through Citrix (pass `test.browser.viewport` to use a different size), sets `server.warmup.clientFiles: ['src/**/*.{ts,tsx}']` so lazily/code-split-imported source (e.g. route components reached only through dynamic `import()`) is transformed up front instead of forcing a page reload mid-test, and excludes `.d.ts` files from the default `server.warmup.clientFiles`/`optimizeDeps.entries` globs so a CJS-style declaration file (e.g. one using `export =`) does not fail the Vite warmup scan. `override` is deep-merged onto the default config via Vite's own `mergeConfig` (a plain object), or applied to the default config outright (a function receiving it) — for changes `mergeConfig` can't express, such as swapping `test.browser.provider` for a different `@vitest/browser-*` provider.
- The mocked framework enables the feature-flag mock by default (no flags enabled) when `@equinor/fusion-framework-module-feature-flag` is installed, so `useFeature` needs no `localStorage`/URL seeding in tests, and defaults navigation to in-memory history rather than browser history (which leaked URL/history state between tests) — `configureFusion`/`enableNavigation` can still opt back into browser history for a test that specifically needs it.

`@vitest/browser-playwright` and `playwright` are peer dependencies of the package. Package documentation provides task-focused guides for setup, configuration, advanced fixtures, module mocks, and troubleshooting so npm, GitHub, and retrieval clients use the same canonical source as the VuePress site.
