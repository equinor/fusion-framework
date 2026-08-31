# @equinor/fusion-framework-vitest-plugin-react-app

## 1.0.0

### Major Changes

- b242ee8: Rename the `testApp`/`test` fixtures for extending the mocked application and parent framework
  configuration: `configure` is now `configureApp`, the new `configureFramework` fixture
  introduced alongside it is now `configureFusion`, and `env` is now `appEnv`.
  
  ```diff
  -const test = testApp.extend('configure', { injected: true }, () => ...);
  +const test = testApp.extend('configureApp', { injected: true }, () => ...);
  
  -test.override('fusion', async ({ env }) => ...);
  +test.override('fusion', async ({ appEnv }) => ...);
  ```
  
  `configureFusion` composes with the base parent-framework mock (app manifest and navigation) the same way `configureApp` composes with the base app-module mock — see [Advanced usage](docs/advanced.md#extend-the-parent-framework-mock-with-configurefusion) for extending framework-scope modules such as feature flags, service discovery, or navigation history.
  
  Also adds `mergeEnvConfig`, a new utility exported from the `/test` entry point for overriding one endpoint's URL (or an `environment` value) on `appEnv` without dropping the rest of the app's `AppConfig` — a plain object spread over `AppConfig` copies nothing, since it stores `environment`/`endpoints` behind private fields exposed only through getters. See [Advanced usage](docs/advanced.md#fake-an-endpoint-url-with-mergeenvconfig).
  
  ```ts
  const test = baseTest.extend('appEnv', ({ appEnv }) =>
    mergeEnvConfig(appEnv, { endpoints: { 'cpr-api': { url: backendBaseUrl } } }),
  );
  ```

### Minor Changes

- a06f73e: `defineProject` now defaults `test.browser.viewport` to `1024x768` instead of Vitest's own
  mobile-sized default, matching the low, fixed resolution most Fusion apps see in production
  through Citrix. Pass `test.browser.viewport` to `defineProject` to use a different size.
- 18ee1cb: Add a `/config` entry-point exporting `defineProject`: a drop-in for Vitest's own `defineProject`, pre-wired with `appTestVitePlugin` and the `@vitest/browser-playwright`/`chromium` browser provider, so a consuming app's own `vitest.config.ts` needs no browser-provider boilerplate.
  
  ```ts
  import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';
  import { name, version } from './package.json' with { type: 'json' };
  
  export default defineProject({ test: { name: `${name}@${version}` } });
  ```
  
  `override` is deep-merged onto the default config via Vite's own `mergeConfig` (a plain object), or applied to the default config outright (a function receiving it) — for changes `mergeConfig` can't express, such as swapping `test.browser.provider` for a different `@vitest/browser-*` provider.
  
  `@vitest/browser-playwright` and `playwright` are now explicit peer dependencies of the package.
  
  Also fixes `appTestVitePlugin`'s `entrypoint` inference: when no `entrypoint` option is given, it now resolves from the Vitest project's own root (via `configResolved`) instead of `process.cwd()`, so each cookbook's `vitest.config.ts` no longer needs to pass `entrypoint` explicitly when run as part of a multi-project Vitest run.
- 18ee1cb: Add `@equinor/fusion-framework-vitest-plugin-react-app`: Vitest/`vitest-browser-react` helpers for testing a Fusion Framework React application inside a real, mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp`/`createComponent` wire up in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`).
  
  ```tsx
  import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app';
  import { useAccessToken } from '@equinor/fusion-framework-react-app/msal';
  
  const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
  await vi.waitFor(() => expect(result.current.pending).toBe(false));
  ```
  
  Highlights:
  
  - `renderAppHook`/`renderAppComponent` — render a hook or component against the real `event`/`http`/`msal` module pipeline, with only the network boundary faked; the result carries a nested `fusion: { framework, app }` for driving a module directly after the initial render.
  - `testApp` — a `vitest` `test` extended with `env`/`configure`/`app`/`render`/`renderHook` fixtures, for a test file whose cases share one mocked scope.
  - `appTestVitePlugin` — a Vite plugin resolving an application's own manifest, config, and module-configurator (the same pipeline `ffc app build`/`ffc app dev` use) as virtual modules.
  - A `/test` entry-point exporting `test`/`render`, pre-seeded from the resolved manifest/config/configure once `appTestVitePlugin` is registered — no per-test `env`/`configure` wiring.
  
  Package documentation provides task-focused guides for setup, configuration, advanced fixtures,
  module mocks, and troubleshooting so npm, GitHub, and retrieval clients use the same canonical
  source as the VuePress site.
- 1ab9eac: `resolveFusion` (and both the `/test` fixtures and `testApp`) now enable the feature-flag
  mock by default, with no flags enabled, so `useFeature` needs no `localStorage` or URL
  seeding in tests.
  
  `@equinor/fusion-framework-module-feature-flag` is an optional peer dependency: the mock is
  only wired up when the package is actually installed, so apps that don't use feature flags
  aren't forced to add it. Install it to get the default mock; call `enableFeatureFlagMock`
  again inside `configureFusion` to seed specific flags.

### Patch Changes

- d333151: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.
  
  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:
  
  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```
- 18ee1cb: Fix `defineProject` not pre-transforming lazily/code-split-imported source (e.g. route
  components reached only through dynamic `import()`), which could force Vite to reload the
  page mid-test and fail the in-flight test file's import.
  
  `defineProject`'s Vite config now sets `server.warmup.clientFiles: ['src/**/*.{ts,tsx}']`, so
  all source under `src/` is transformed up front instead of on first request.
- 18ee1cb: Document `test.override(...)` for overriding a fixture (`configure`, `fusion`, etc.) within a
  single test file or `describe` block, alongside the existing `test.extend(...)` guide, in the
  package's "Advanced usage" doc (`docs/advanced.md`).
- 1ab9eac: Exclude `.d.ts` files from the default `server.warmup.clientFiles` and `optimizeDeps.entries`
  globs in `defineProject`. Previously, an app shipping a CJS-style declaration file (for example
  one using `export =`) failed the Vite warmup scan, since it was loaded as ESM.
- 18ee1cb: Add a "Migrate an existing app" guide (`docs/migrating-an-existing-app.md`) covering how to
  move a suite from `@testing-library/react`/jsdom/happy-dom onto this package: installing
  Browser Mode, replacing hand-rolled `vi.mock`s of Fusion hooks with each module's `enable*Mock`
  entry point, porting a hand-written mock HTTP server to `createRouterMiddleware`, composing a
  router fixture with a domain-state fixture in one file, and updating renders/assertions to the
  async `vitest-browser-react` API. Linked from the package README and from
  `docs/overview.md` and `testing-choosing-a-layer.md`.
- 1ab9eac: Revert the mocked framework's default navigation history from browser history back to in-memory
  history. Browser history leaked URL/history state between tests; `configureFusion`/`enableNavigation`
  can still opt back into browser history for a test that specifically needs it.
- 18ee1cb: Add a "Why Browser Mode is the default" guide (`docs/why-browser-mode.md`) explaining
  the rationale for defaulting to real Chromium over DOM emulation (the documented React 19 peer
  dependency crash in the previous renderer, plus the framework's real-module testing philosophy),
  the actual performance tradeoff (a real browser is slower, not faster — this was a fidelity
  choice, not a speed optimization), and how to bring your own renderer for a single test file by
  composing `mockFramework`/`mockAppModules`/`FrameworkProvider`/`ModuleProvider` directly with a
  different render function (e.g. `@testing-library/react` on `happy-dom`). Linked from the
  package README and `docs/overview.md`.
- Updated dependencies [d333151]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [bd43eca]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [bd43eca]
- Updated dependencies [bd43eca]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [18ee1cb]
- Updated dependencies [2899c8a]
  - @equinor/fusion-framework@8.1.0
  - @equinor/fusion-framework-app@13.1.0
  - @equinor/fusion-framework-cli@15.3.0
  - @equinor/fusion-framework-module@6.1.3
  - @equinor/fusion-framework-module-app@8.1.0
  - @equinor/fusion-framework-module-feature-flag@2.1.0
  - @equinor/fusion-framework-module-navigation@7.0.9
  - @equinor/fusion-framework-react@9.0.0
  - @equinor/fusion-framework-react-module@4.0.3
  - @equinor/fusion-imports@2.0.3

## 1.0.0-next.6

### Patch Changes

- Updated dependencies [09a9bcc]
- Updated dependencies [09a9bcc]
- Updated dependencies [09a9bcc]
  - @equinor/fusion-framework-cli@15.3.0-next.1
  - @equinor/fusion-framework-module-feature-flag@2.1.0-next.1
  - @equinor/fusion-imports@2.0.3-next.1
  - @equinor/fusion-framework-app@13.0.3-next.1
  - @equinor/fusion-framework@8.1.0-next.2

## 1.0.0-next.5

### Minor Changes

- 1813f8a: `resolveFusion` (and both the `/test` fixtures and `testApp`) now enable the feature-flag
  mock by default, with no flags enabled, so `useFeature` needs no `localStorage` or URL
  seeding in tests.
  
  `@equinor/fusion-framework-module-feature-flag` is an optional peer dependency: the mock is
  only wired up when the package is actually installed, so apps that don't use feature flags
  aren't forced to add it. Install it to get the default mock; call `enableFeatureFlagMock`
  again inside `configureFusion` to seed specific flags.

### Patch Changes

- 1813f8a: Exclude `.d.ts` files from the default `server.warmup.clientFiles` and `optimizeDeps.entries`
  globs in `defineProject`. Previously, an app shipping a CJS-style declaration file (for example
  one using `export =`) failed the Vite warmup scan, since it was loaded as ESM.
- 1813f8a: Revert the mocked framework's default navigation history from browser history back to in-memory
  history. Browser history leaked URL/history state between tests; `configureFusion`/`enableNavigation`
  can still opt back into browser history for a test that specifically needs it.
- Updated dependencies [c8008e3]
  - @equinor/fusion-framework-app@13.0.3-next.0
  - @equinor/fusion-framework-cli@15.2.11-next.0
  - @equinor/fusion-framework-module-app@8.0.6-next.0
  - @equinor/fusion-framework-module-navigation@7.0.9-next.0
  - @equinor/fusion-framework-react@9.0.0-next.0
  - @equinor/fusion-framework-module-feature-flag@2.1.0-next.0

## 1.0.0-next.4

### Major Changes

- b3d46e0: Rename the `testApp`/`test` fixtures for extending the mocked application and parent framework
  configuration: `configure` is now `configureApp`, the new `configureFramework` fixture
  introduced alongside it is now `configureFusion`, and `env` is now `appEnv`.

  ```diff
  -const test = testApp.extend('configure', { injected: true }, () => ...);
  +const test = testApp.extend('configureApp', { injected: true }, () => ...);

  -test.override('fusion', async ({ env }) => ...);
  +test.override('fusion', async ({ appEnv }) => ...);
  ```

  `configureFusion` composes with the base parent-framework mock (app manifest and navigation) the same way `configureApp` composes with the base app-module mock — see [Advanced usage](docs/advanced.md#extend-the-parent-framework-mock-with-configurefusion) for extending framework-scope modules such as feature flags, service discovery, or navigation history.

  Also adds `mergeEnvConfig`, a new utility exported from the `/test` entry point for overriding one endpoint's URL (or an `environment` value) on `appEnv` without dropping the rest of the app's `AppConfig` — a plain object spread over `AppConfig` copies nothing, since it stores `environment`/`endpoints` behind private fields exposed only through getters. See [Advanced usage](docs/advanced.md#fake-an-endpoint-url-with-mergeenvconfig).

  ```ts
  const test = baseTest.extend("appEnv", ({ appEnv }) =>
    mergeEnvConfig(appEnv, {
      endpoints: { "cpr-api": { url: backendBaseUrl } },
    }),
  );
  ```

## 0.2.0-next.3

### Patch Changes

- @equinor/fusion-framework-cli@15.2.8-next.2
- @equinor/fusion-framework-app@14.0.0-next.1
- @equinor/fusion-framework@8.1.0-next.1

## 0.2.0-next.2

### Minor Changes

- 7cdd512: `defineProject` now defaults `test.browser.viewport` to `1024x768` instead of Vitest's own
  mobile-sized default, matching the low, fixed resolution most Fusion apps see in production
  through Citrix. Pass `test.browser.viewport` to `defineProject` to use a different size.

## 0.2.0-next.1

### Patch Changes

- @equinor/fusion-framework-cli@15.2.8-next.1

## 0.2.0-next.0

### Minor Changes

- 2836e0b: Add a `/config` entry-point exporting `defineProject`: a drop-in for Vitest's own `defineProject`, pre-wired with `appTestVitePlugin` and the `@vitest/browser-playwright`/`chromium` browser provider, so a consuming app's own `vitest.config.ts` needs no browser-provider boilerplate.

  ```ts
  import { defineProject } from "@equinor/fusion-framework-vitest-plugin-react-app/config";
  import { name, version } from "./package.json" with { type: "json" };

  export default defineProject({ test: { name: `${name}@${version}` } });
  ```

  `override` is deep-merged onto the default config via Vite's own `mergeConfig` (a plain object), or applied to the default config outright (a function receiving it) — for changes `mergeConfig` can't express, such as swapping `test.browser.provider` for a different `@vitest/browser-*` provider.

  `@vitest/browser-playwright` and `playwright` are now explicit peer dependencies of the package.

  Also fixes `appTestVitePlugin`'s `entrypoint` inference: when no `entrypoint` option is given, it now resolves from the Vitest project's own root (via `configResolved`) instead of `process.cwd()`, so each cookbook's `vitest.config.ts` no longer needs to pass `entrypoint` explicitly when run as part of a multi-project Vitest run.

- 2836e0b: Add `@equinor/fusion-framework-vitest-plugin-react-app`: Vitest/`vitest-browser-react` helpers for testing a Fusion Framework React application inside a real, mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp`/`createComponent` wire up in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`).

  ```tsx
  import { renderAppHook } from "@equinor/fusion-framework-vitest-plugin-react-app";
  import { useAccessToken } from "@equinor/fusion-framework-react-app/msal";

  const { result } = await renderAppHook(() =>
    useAccessToken({ scopes: ["User.Read"] }),
  );
  await vi.waitFor(() => expect(result.current.pending).toBe(false));
  ```

  Highlights:

  - `renderAppHook`/`renderAppComponent` — render a hook or component against the real `event`/`http`/`msal` module pipeline, with only the network boundary faked; the result carries a nested `fusion: { framework, app }` for driving a module directly after the initial render.
  - `testApp` — a `vitest` `test` extended with `env`/`configure`/`app`/`render`/`renderHook` fixtures, for a test file whose cases share one mocked scope.
  - `appTestVitePlugin` — a Vite plugin resolving an application's own manifest, config, and module-configurator (the same pipeline `ffc app build`/`ffc app dev` use) as virtual modules.
  - A `/test` entry-point exporting `test`/`render`, pre-seeded from the resolved manifest/config/configure once `appTestVitePlugin` is registered — no per-test `env`/`configure` wiring.

  Package documentation provides task-focused guides for setup, configuration, advanced fixtures,
  module mocks, and troubleshooting so npm, GitHub, and retrieval clients use the same canonical
  source as the VuePress site.

### Patch Changes

- e8aae1f: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.

  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:

  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```

- 2836e0b: Fix `defineProject` not pre-transforming lazily/code-split-imported source (e.g. route
  components reached only through dynamic `import()`), which could force Vite to reload the
  page mid-test and fail the in-flight test file's import.

  `defineProject`'s Vite config now sets `server.warmup.clientFiles: ['src/**/*.{ts,tsx}']`, so
  all source under `src/` is transformed up front instead of on first request.

- 2836e0b: Document `test.override(...)` for overriding a fixture (`configure`, `fusion`, etc.) within a
  single test file or `describe` block, alongside the existing `test.extend(...)` guide, in the
  package's "Advanced usage" doc (`docs/advanced.md`).
- 2836e0b: Add a "Migrate an existing app" guide (`docs/migrating-an-existing-app.md`) covering how to
  move a suite from `@testing-library/react`/jsdom/happy-dom onto this package: installing
  Browser Mode, replacing hand-rolled `vi.mock`s of Fusion hooks with each module's `enable*Mock`
  entry point, porting a hand-written mock HTTP server to `createRouterMiddleware`, composing a
  router fixture with a domain-state fixture in one file, and updating renders/assertions to the
  async `vitest-browser-react` API. Linked from the package README and from
  `docs/overview.md` and `testing-choosing-a-layer.md`.
- 2836e0b: Add a "Why Browser Mode is the default" guide (`docs/why-browser-mode.md`) explaining
  the rationale for defaulting to real Chromium over DOM emulation (the documented React 19 peer
  dependency crash in the previous renderer, plus the framework's real-module testing philosophy),
  the actual performance tradeoff (a real browser is slower, not faster — this was a fidelity
  choice, not a speed optimization), and how to bring your own renderer for a single test file by
  composing `mockFramework`/`mockAppModules`/`FrameworkProvider`/`ModuleProvider` directly with a
  different render function (e.g. `@testing-library/react` on `happy-dom`). Linked from the
  package README and `docs/overview.md`.
- Updated dependencies [e8aae1f]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
- Updated dependencies [2836e0b]
  - @equinor/fusion-framework@8.1.0-next.0
  - @equinor/fusion-framework-app@14.0.0-next.0
  - @equinor/fusion-framework-cli@15.2.8-next.0
  - @equinor/fusion-framework-module@6.1.3-next.0
  - @equinor/fusion-framework-module-app@8.1.0-next.0
  - @equinor/fusion-framework-react@9.0.0-next.0
  - @equinor/fusion-framework-react-module@4.0.3-next.0
  - @equinor/fusion-imports@2.0.3-next.0
