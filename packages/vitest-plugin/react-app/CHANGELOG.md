# @equinor/fusion-framework-vitest-plugin-react-app

## 1.0.3

### Patch Changes

- Updated dependencies [e3555f9]
  - @equinor/fusion-framework-cli@15.3.3

## 1.0.2

### Patch Changes

- Updated dependencies [086fec5]
- Updated dependencies [98ff08c]
- Updated dependencies [9fc39ae]
- Updated dependencies [b5c6737]
- Updated dependencies [3acf1f7]
  - @equinor/fusion-framework-cli@15.3.2
  - @equinor/fusion-framework-app@13.1.2
  - @equinor/fusion-framework@8.1.2

## 1.0.1

### Patch Changes

- d48a913: Install the feature-flag and telemetry framework modules with the React app Vitest plugin so applications do not need to declare them separately to run tests. The plugin automatically enables the parent feature-flag mock only when the application declares the feature-flag module as a runtime dependency.
- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.
- Updated dependencies [d04e564]
  - @equinor/fusion-framework-app@13.1.1
  - @equinor/fusion-framework-cli@15.3.1
  - @equinor/fusion-framework@8.1.1
  - @equinor/fusion-framework-module-app@8.1.1
  - @equinor/fusion-framework-module-feature-flag@2.1.1
  - @equinor/fusion-framework-module@6.1.4
  - @equinor/fusion-framework-module-navigation@7.0.10
  - @equinor/fusion-framework-module-telemetry@7.1.1
  - @equinor/fusion-framework-react@9.0.1
  - @equinor/fusion-framework-react-module@4.0.4
  - @equinor/fusion-imports@2.0.4

## 1.0.0

### Minor Changes

- f663b46: Add `@equinor/fusion-framework-vitest-plugin-react-app`: Vitest/`vitest-browser-react` helpers for testing a Fusion Framework React application inside a real, mock-backed application module scope — the same `FrameworkProvider` + `ModuleProvider` nesting `renderApp`/`createComponent` wire up in production, backed by `mockFramework` and `mockAppModules` (`@equinor/fusion-framework-app/mock`).
  
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

### Patch Changes

- f663b46: Document `test.override(...)` for overriding a fixture (`configure`, `fusion`, etc.) within a
  single test file or `describe` block, alongside the existing `test.extend(...)` guide, in the
  package's "Advanced usage" doc (`docs/advanced.md`).
- f663b46: Add a "Migrate an existing app" guide (`docs/migrating-an-existing-app.md`) covering how to
  move a suite from `@testing-library/react`/jsdom/happy-dom onto this package: installing
  Browser Mode, replacing hand-rolled `vi.mock`s of Fusion hooks with each module's `enable*Mock`
  entry point, porting a hand-written mock HTTP server to `createRouterMiddleware`, composing a
  router fixture with a domain-state fixture in one file, and updating renders/assertions to the
  async `vitest-browser-react` API. Linked from the package README and from
  `docs/overview.md` and `testing-choosing-a-layer.md`.
- f663b46: Add a "Why Browser Mode is the default" guide (`docs/why-browser-mode.md`) explaining
  the rationale for defaulting to real Chromium over DOM emulation (the documented React 19 peer
  dependency crash in the previous renderer, plus the framework's real-module testing philosophy),
  the actual performance tradeoff (a real browser is slower, not faster — this was a fidelity
  choice, not a speed optimization), and how to bring your own renderer for a single test file by
  composing `mockFramework`/`mockAppModules`/`FrameworkProvider`/`ModuleProvider` directly with a
  different render function (e.g. `@testing-library/react` on `happy-dom`). Linked from the
  package README and `docs/overview.md`.
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
  - @equinor/fusion-framework-app@13.1.0
  - @equinor/fusion-framework-cli@15.3.0
  - @equinor/fusion-framework@8.1.0
  - @equinor/fusion-framework-module-feature-flag@2.1.0
  - @equinor/fusion-imports@2.0.3
  - @equinor/fusion-framework-module-app@8.1.0
  - @equinor/fusion-framework-module@6.1.3
  - @equinor/fusion-framework-module-navigation@7.0.9
  - @equinor/fusion-framework-react-module@4.0.3
  - @equinor/fusion-framework-react@9.0.0
